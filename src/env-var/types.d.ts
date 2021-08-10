export  interface Service {
  name: string,
  variables?: Variable[],
}

export interface Variable {
  name: string,
  value: string,
}

export interface VariableName {
  name: string,
}
