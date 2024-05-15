export default function getStyleByKey(style, key) {
    const obj = {};
    const stylesArr = style.split(";");

    // Using for...of loop instead of forEach
    for (const v of stylesArr) {
        const [keyPart, value] = v.split("=");
        obj[keyPart.trim()] = value.trim();
    }

    return obj[key];
}
