import { attach } from "./lib/attach";
import Framebus from "./framebus";

const bus = new Framebus();

attach();

export = bus;
