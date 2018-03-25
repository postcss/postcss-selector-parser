export default function getProp (obj, ...props) {
    while (props.length > 0) {
        const prop = props.shift();

        if (!obj[prop]) {
            return undefined;
        }

        obj = obj[prop];
    }

    return obj;
}
