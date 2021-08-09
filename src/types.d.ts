
// START:  Belongs to addon
interface Application {
  name: string,
  link: string,
  instance: Instance,
  zone: Zone,
}
interface Instance {
  variant: InstanceVariant,
}

interface InstanceVariant {
  name: string,
  logo: string,
}

// END

interface Zone {
  countryCode: string,   // ISO 3166-1 alpha-2 code of the country (2 letters): "FR", "CA", "US"...
  city: string,          // Name of the city in english: "Paris", "Montreal", "New York City"...
  country: string,       // Name of the country in english: "France", "Canada", "United States"...
  displayName?: string,  // Optional display name for private zones (instead of displaying city + country): "ACME (dedicated)"...
  tags: string[],        // Array of strings for semantic tags: ["region:eu", "infra:clever-cloud"], ["scope:private"]...
}
