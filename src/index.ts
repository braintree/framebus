import { attach } from "./lib/attach";
import Framebus = require("./framebus");

const bus = new Framebus();

attach();

export = bus;
