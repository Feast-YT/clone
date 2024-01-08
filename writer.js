class Writer {
    constructor() {
        this.bytes = [];
    }

    writeUint8(val) {
        this.bytes.push(val);
    }

    writeUint16(val) {
        this.bytes.push(val & 0xFF);
        this.bytes.push((val >> 8) & 0xFF);
    }

    writeUint32(val) {
        this.bytes.push(val & 0xFF);
        this.bytes.push((val >> 8) & 0xFF);
        this.bytes.push((val >> 16) & 0xFF);
        this.bytes.push((val >> 24) & 0xFF);
    }

    writeString(str) {
        for (let i = 0; i < str.length; i++) {
            this.writeUint8(str.charCodeAt(i));
            this.writeUint8(0); 
        }
    }
}

module.exports = Writer;