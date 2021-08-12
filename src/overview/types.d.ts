export interface Consumption {
  yesterday: number,
  last30Days: number,
}

export interface Deployment {
  state: string,
  action: string,
  date: string,
  logsUrl: string,
}

export interface Flavor {
  name: string,
  cpus: number,
  gpus: number,
  mem: number,
  microservice: boolean,
}

export interface Instance {
  flavourName: string,
  count: number,
}

export interface InstancesState {
  running: Instance[],
  deploying: Instance[],
}


// TODO: correct this one because it represents what is contained in an index of an array
// export interface RequestsData [
//   Number, // Start timestamp in milliseconds. Expected to be rounded to the hour of its respective TZ.
//   Number, // End timestamp in milliseconds. Expected to be rounded to the hour of its respective TZ.
//   Number, // Number of request during this time window.
// ]


export interface Scalability {
  minFlavor: Flavor,
  maxFlavor: Flavor,
  minInstances: number,
  maxInstances: number,
}


