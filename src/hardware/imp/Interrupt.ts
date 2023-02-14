export interface Interrupt{

    IRQ : number
    priority : number
    interruptName : string
    IOBuffer : number[][]     //[0][] = input , [1][] = output

}