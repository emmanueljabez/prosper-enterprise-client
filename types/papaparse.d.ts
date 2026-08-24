declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[]
    errors: Array<{ message: string }>
  }

  const Papa: {
    parse<T = string[]>(input: string, config?: { skipEmptyLines?: boolean | 'greedy' }): ParseResult<T>
  }

  export default Papa
}
