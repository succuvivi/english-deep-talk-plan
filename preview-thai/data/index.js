import { restaurantEntries } from './restaurant.js';
import { coffeeEntries } from './coffee.js';
import { convenienceEntries } from './convenience.js';
import { marketEntries } from './market.js';
import { taxiEntries } from './taxi.js';
import { motorbikeEntries } from './motorbike.js';
import { directionsEntries } from './directions.js';
import { petrolEntries } from './petrol.js';
import { deliveryEntries } from './delivery.js';
import { condoEntries } from './condo.js';
import { repairsEntries } from './repairs.js';
import { laundryEntries } from './laundry.js';
import { massageEntries } from './massage.js';
import { hospitalEntries } from './hospital.js';
import { bankEntries } from './bank.js';
import { mobileEntries } from './mobile.js';
import { greetingsEntries } from './greetings.js';
import { friendsEntries } from './friends.js';
import { applySeriesMetadata } from './series.js';
import { applyAudioMetadata } from './audio-map.js';

const BASE_ENTRIES = [
  ...restaurantEntries,
  ...coffeeEntries,
  ...convenienceEntries,
  ...marketEntries,
  ...taxiEntries,
  ...motorbikeEntries,
  ...directionsEntries,
  ...petrolEntries,
  ...deliveryEntries,
  ...condoEntries,
  ...repairsEntries,
  ...laundryEntries,
  ...massageEntries,
  ...hospitalEntries,
  ...bankEntries,
  ...mobileEntries,
  ...greetingsEntries,
  ...friendsEntries,
];

export const ENTRIES = applyAudioMetadata(applySeriesMetadata(BASE_ENTRIES));
