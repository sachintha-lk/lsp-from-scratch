import { documents, TextDocumentIdentifier } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import * as fs from "fs";

const words = fs.readFileSync("/usr/share/dict/words").toString().split("\n");
const items = words.map( (word) => { return {
    label: word
}})

type CompletionItem = {
    label: string;
}

interface CompletionList {
	isIncomplete: boolean;
	items: CompletionItem[];
}

interface Position {
    line: number;
    character: number;
}

interface TextDocumentPositionParams {
    textDocument: TextDocumentIdentifier;
    position: Position;
}

export interface CompletionParams extends TextDocumentPositionParams {

}

export const completion = ( message: RequestMessage ): CompletionList | null => {
    const params = message.params as CompletionParams;
    const content = documents.get(params.textDocument.uri);

    if (!content) {
        return null;
    }

    const currentLine = content.split("\n")[params.position.line];
    const lineUntilCursor = currentLine.slice(0, params.position.character);
    const currentPrefix = lineUntilCursor.replace(/.*\W(.*?)/, "$1");

    const items = words.filter( (word) => {
        return word.startsWith(currentPrefix)
    })
    .slice(0, 1000)
    .map( (word) => {
        return { label: word };
    });

    return {
        isIncomplete: true,
        items: items
    }
}