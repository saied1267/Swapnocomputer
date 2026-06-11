const data = [
  // Image 1: Roll 141-154
  ["Md Rayhan", "Md Lokman", "MMomena Begum", "Aman Bazar", "01325871562", "Computer Office Application", "141", "1234"],
  ["Abu Obayda", "MD Nasir", "Saheda sultana", "Fokir para", "01882679001", "Computer Office Application", "142", "1234"],
  ["Touhidul Islam Abir", "Abu Taher", "Nasima Akter", "Asraf alir Bari", "01870406514", "Computer Office Application", "143", "1234"],
  ["Sayed khan rahat", "Shamsul alom", "Josna akter", "Jugirhat", "018xxxxxxxx", "Computer Office Application", "144", "1234"],
  ["Hosen Al Jaber", "Jakir Hose", "Nilu Akter", "Jugirhat", "01863350746", "Computer Office Application", "145", "1234"],
  ["Mahfuj Ahmed", "Monir Ahamed", "Sharmin akter", "Aman Bazar", "01896093213", "Computer Office Application", "146", "1234"],
  ["Md arafat", "Mohammad Sarowar", "Asma begum", "SIKABPUR", "0181912236", "Computer Office Application", "147", "1234"],
  ["Jinuh Marma", "#", "#", "Borodigirpar", "01619755108", "Computer Office Application", "148", "1234"],
  ["Md shakil", "Abdus salam", "Mst Shanaj", "Cantonment", "01805058414", "Computer Office Application", "149", "1234"],
  ["Sanjida Nur jerin", "Muhammad Nur Nobi", "Ruzi Akther", "Zugirhat", "01793044702", "Computer Office Application", "150", "1234"],
  ["Nusrat Jahan", "Asraf Hosen", "Farhana Kanom", "Aman Bazar", "01617261259", "Computer Office Application", "151", "1234"],
  ["Kakoli Das", "Mintu Das", "Purnima Das", "Aman Bazar", "01834792118", "Computer Office Application", "152", "1234"],
  ["Asaduzzaman Rifat", "Ayub khan", "Ferdus Begum", "Aman bazar", "01861857505", "Computer Office Application", "153", "1234"],
  ["anjan dev nath", "Sapan kumar Dev nath", "Nrva rani debi", "Aman bazar", "01861141277", "Computer Office Application", "154", "1234"]
];

const formatted = data.map(d => ({
  roll: d[6],
  name: d[0],
  fatherName: d[1],
  motherName: d[2],
  address: d[3],
  mobile: d[4],
  course: d[5],
  pin: d[7],
  regDate: "2026-06-10"
}));

console.log(JSON.stringify(formatted, null, 2));
