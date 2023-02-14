export class Ascii {

    private chars : string[] =
        []
    private hex : number[] =
        []

    /*
        Will convert binary to string using ASCII encoding
     */
    public static toChar(hex : number) : string {
        let char : string
        char = String.fromCharCode(hex)
        return char
    }

    /*
        Will convert an ASCII string to
     */
    public static toHex(char : string) : number{
        let hex : number
        hex = char.charCodeAt(0)
        return hex
    }
}
