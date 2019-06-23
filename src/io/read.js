// @flow

import MapParser from "../model/mapParser";
import {State} from "../model/model";

export class Reader {
    mapParser: MapParser;

    constructor(folder: string, model: string, customPath: string|null = null) {
        let filename = `./${folder}/prob-${model}.desc`;

        if (customPath) {
            filename = customPath;
        }

        this.mapParser = new MapParser(filename);
    }

    read(): State {
        return this.mapParser.getState();
    }
}