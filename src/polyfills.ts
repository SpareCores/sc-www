
import * as process from 'process';
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).Buffer = (window as any).Buffer || Buffer;
(window as any).process = process;
