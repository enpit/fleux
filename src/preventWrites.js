export default function (obj, errorMessage) {
    return new Proxy(obj, {
        set: function () {
            throw new Error(errorMessage || 'Refusing to write to immutable object.');
        }
    });
}
