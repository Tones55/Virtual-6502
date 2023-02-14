import {Interrupt} from "./imp/Interrupt";
import {Hardware} from "./Hardware";

export class Keyboard extends Hardware implements Interrupt{

    IRQ
    priority
    interruptName
    IOBuffer

    constructor(){
        super(0 , "Keyboard")
        this.IRQ = 0b000
        this.priority = 0x00
        this.interruptName = "Keyboard"
        this.IOBuffer = [[/*input*/] , [/*output*/]]
    }


}