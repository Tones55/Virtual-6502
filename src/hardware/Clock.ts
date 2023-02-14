import {Hardware} from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

export class Clock extends Hardware {

    private clockListeners = new Array<ClockListener>()
    private timer
    private CLOCK_INTERVAL

    constructor(hardware : Array<ClockListener> , CLOCK_INTERVAL : number){
        super(0 , "Clock")
        this.clockListeners = hardware
        this.CLOCK_INTERVAL = CLOCK_INTERVAL

        //set sendPulse to 
        this.timer = setInterval(this.sendPulse , this.CLOCK_INTERVAL , this.clockListeners)
    }

    /*
        tell the hardware to call their pulse methods
     */
    public sendPulse(list : Array<ClockListener>) : void{
        //this.log("Clock pulse initialized")   //TypeError: this.log is not a function

            list[1].pulse()
            list[0].pulse()
    }

    /*
        stops the clock
     */
    public stopClock() {
        setTimeout(clearInterval, this.CLOCK_INTERVAL, this.timer)
    }
}