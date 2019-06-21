// @flow
import {exec} from "./index";

if (process.send === undefined) {
    console.log('Single launch');
    exec('001',() => 0);
} else {
    process.on('message', (msg) => {
            console.log(msg);
            if (msg.type === 'kill') {
                process.exit(0);
            }
            if (msg.type === 'start') {
                process.send({type: 'ask'});
            }
            if (msg.type === 'model') {
                exec(msg.model, () => {
                    process.send({type: 'ask'})
                });
            }
        }
    );
}

