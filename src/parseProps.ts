import typeOf from 'just-typeof';

export default function parseProps (propNames: any[]): Array<Array<Object>> {
    if (propNames.every((propName) => typeof propName === 'string')) {
        return [ propNames, propNames ];
    } else if (propNames.length === 1 && Array.isArray(propNames) && Array.isArray(propNames[0])) {
        if (propNames[0].every((propName) => typeof propName === 'string')) {
            return [ propNames[0] , [] ];
        } else {
            return parseProps(propNames[0]);
        }
    } else if (propNames.length <= 2 && propNames.every((propName) => Array.isArray(propName) || typeOf(propName) === 'null')) {
        return [ propNames[0] || [], propNames[1] || [] ];
    } else {
        throw Error(`Failed to parse props. Rejected arguments of the types ${propNames.map(propName => typeof propName)}`);
    }
}
