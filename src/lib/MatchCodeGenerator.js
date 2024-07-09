// src/lib/MatchCodeGenerator.js
import { v4 as uuidv4 } from 'uuid';

class MatchCodeGenerator {
    static generateMatchCodeWithUUID() {
        return uuidv4();
    }
}

export default MatchCodeGenerator;
