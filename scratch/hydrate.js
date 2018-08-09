'use strict';

const people = [
  { id: 2, name: 'John Doe', age: 34, petName: 'Rex', petType: 'dog' },
  { id: 3, name: 'Mary Jane', age: 19, petName: 'Mittens', petType: 'kitten' },

  { id: 3, name: 'Mary Jane', age: 19, petName: 'Fluffy', petType: 'cat' },
  { id: 2, name: 'John Doe', age: 34, petName: 'Spot', petType: 'dog' }
];

const hydrated = {};

const results = [];

people.forEach((person) => {
  if (!(person.id in hydrated)) {
    hydrated[person.id] = {
      id: person.id,
      name: person.name,
      age: person.age,
      pets: []
    };
  }
});

people.forEach((person) => {
  hydrated[person.id].pets.push({
    name: person.petName,
    type: person.petType
  });
});

hydrated.forEach((person) => {
  results.push(person);
});

console.log(JSON.stringify(hydrated, null, 2));
