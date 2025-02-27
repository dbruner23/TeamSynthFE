export interface ParsedData {
  type: string;
  content: any;
  text?: string;
  code?: string;
  language?: string;
}

export interface TaskOutput {
  id?: string;
  agent: string;
  type?: string;
  content?: string;
  code_blocks?: string[];
  parsed_data: ParsedData[];
  timestamp?: string;
}
