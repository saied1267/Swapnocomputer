const fs = require('fs');

const input = `Md Minhajul Kabir	Humayoun Kabir	Sarbin Akter	Aman bazar	01752563250	Office Management	101	2009
Nur Islam Babo	Nasir Miya	Sahin Akter	Volioya para	01886515246	Office Management	102	2007
Hamida Sulthana	MD.Nasir	Kulsuma Aktar	Lalirhat	01830346676	Office Management	103	2010
RAKIBUL Hassan	Belal hossain	Rahima akter	Aman bazar	01872676210	Office Management	104	2008
Suprity Shil	Rakhal Shil	Ratna Shil	Khandakia	01996725194	Office Management	105	2006
Tusha chowdhury	Ajoy chowdhury	Arssna chowdhury	shikarpur	01585727018	Office Management	106	2020
Jubayer Ivna	Monsur Alam	Rubi Akter	Kulgaw	01860260834	Office Management	107	1234
Shirin Akter	Jane Alam	Parvin Akter	Kulgaw	01727718747	Office Management	108	1234
Nusrat Alam	Mohammed Khursed Alam	Shamim Akter	Khandakia	01885340870	Office Management	109	1885
Emon	Shahjhan	Feroza	Aman bazar	01642870994	Office Management	110	1100
Sharmin Jerin	Naser Uddin	Jesmin Akter	Notunpara	01863374176	Office Management	112	7417
Hasan Tareq	Mohammad syed hossaIN	Rashada Akter	Foteyabad	1994446992	Office Management	113	1234
Taohid Tanvir	Quabi Farid Hyder	Nasira hyder	Aman Bazar	1812373946	Office Management	114	1234
Yasar Bin Faiz	Faizul Islam Sikder	Jesmin Akter	aman bazar	01631829762	Office Management	115	1234
Ikrar Jahan	Md yousop	taslima akter	Aman bazar	01821305317	Office Management	116	1234
Md minhaj ahamed fahim	mintu	rehena begum	Aman bazar	01824560010	Office Management	117	1234
ismot jerin nikita	abul bashaR	LUTFOR NAHAR	Aman bazar	01830218417	Office Management	118	1234
Meherunnesa joya	mohammad jamir uddin	khadija yeasmin	Aman bazar	01311813579	Office Management	119	1234
Rehena Akter Ranu	Md. Osman Goni	Nasima Akter	Vuliya para	01877918648	Office Management	120	1234
Sapana newaz tahiba	Habib Ullah	Jaheda Akter	Notun para	01877419244	Office Management	121	1234
Bibi Fatema happy	Md idrish	Bibi Khadiza	Foteyabad	01894108307	Office Management	122	1234
Tasnim Akter	Bahadur Alam	Yasmin Akter	Foteyabad	01617788376	Office Management	123	1234
Noman Uddin Tareq	Abul Bashar	Rosha Akter	Shikarpur	01881126795	Office Management	124	1234
Md Nayem Uddin	Md Nizam Uddin	Jesia Sharif Dilu	Aman bazar	01882694138	Office Management	125	1234
Papon Pal	Ashutos Pal	Dilu Pal	Shikarpur	01861210597	Office Management	126	1234
Mohammad Emon	Md Farid Meah	Parvin Akther	Shikarpur	01601034628	Office Management	127	1234
Sayed Hossen Fahim	Mohammad Hossain	Shahanaz Begum	Sub register Bari	01806255435	Office Management	128	1234
Farhan Islam	Md Kamal Hossain	Razia Sultana	Khosal Shah	01771010201	Office Management	129	1234
Md Jaber Jonaed	Md Abdus Salam	Shamsur nahar	Nosrullah Kazi Bari	01815478891	Office Management	130	1234
Irfanul Haq	Anamul Haq	Lucky Akter	Vuliya Para	01615749042	Office Management	131	1234
Shakib Hasan Hridoy	Md Anwar Hossain	Ms Halima Begum	Cantonment	01304330300	Office Management	132	1234
Hasibul Islam Ontor	Md Anwar Hossain	Ms Halima Begum	Cantonment	01318798163	Office Management	133	1234
Harunur Rashid	Md Abdul Mannan	NurnaharBegum	Aman Bazar	01836553630	Office Management	134	1234
Shahed ul Islam	Jamal Uddin	Roma Akter	Abdul roshid Bari	01941942704	Office Management	135	1234
Saidul islam Afif	Md Rafique	Rehana Akter	Zugirhat	01710845370	Office Management	136	1234
Ajmain Khan	Saifuffin Khan	Muna Khanam	Aman Bazar	01829977777	Office Management	137	1234
Tanzibul Islam	Zahedul islam	Jannatul Naiyen	Aman Bazar	01754025417	Office Management	138	1234
Mohammad Jayedul Hasan	Md jalal uddin	Shanaj Begum	Juhgir Hat	01828146802	Office Management	139	1234
Onik Mutsuddi	Monojit Mutsuddi	Purnima Mutsuddi	Aman Bazar	01610235434	Office Management	140	1234
Md Rayhan	Md Lokman	MMomena Begum	Aman Bazar	01325871562	Office Management	141	1234
Abu Obayda	MD Nasir	Saheda sultana	Fokir para	01882679001	Office Management	142	1234
Touhidul Islam Abir	Abu Taher	Nasima Akter	Asraf alir Bari	01870406514	Office Management	143	1234
Sayed khan rahat	Shamsul alom	Josna akter	Jugirhat	018xxxxxxx	Office Management	144	1234
Hosen Al Jaber	Jakir Hose	Nilu Akter	Jugirhat	01863350746	Office Management	145	1234
Mahfuj Ahmed	Monir Ahamed	Sharmin akter	Aman Bazar	01896093213	Office Management	146	1234
Md arafat	Mohammad Sarowar	Asma begum	SIKABPUR	01819162236	Office Management	147	1234
Jinuh Marma	#	#	Borodigirpar	01619755108	Office Management	148	1234
Md shakil	Abdus salam	Mst Shanaj	Cantonment	01805058414	Office Management	149	1234
Sanjida Nur jerin	Muhammad Nur Nobi	Ruzi Akther	Zugirhat	01793044702	Office Management	150	1234
Nusrat Jahan	Asraf Hosen	Farhana Kanom	Aman Bazar	01617261259	Office Management	151	1234
Kakoli Das	Mintu Das	Purnima Das	Aman Bazar	01834792118	Office Management	152	1234
Asaduzzaman Rifat	Ayub khan	Ferdus Begum	Aman bazar	01861857505	Office Management	153	1234
anjan dev nath	Sapan kumar Dev nath	Nrva rani debi	Aman bazar	01861141277	Office Management	154	1234`;

const lines = input.trim().split('\n');
const students = lines.map((line, index) => {
    const parts = line.split('\t');
    if (parts.length < 8) return null;
    return {
        name: parts[0],
        fatherName: parts[1],
        motherName: parts[2],
        address: parts[3],
        mobile: parts[4],
        course: "Computer Office Application", // Mapping "Office Management" to existing course
        roll: parts[6],
        pin: parts[7],
        regDate: "2026-06-10",
        serialNo: index + 1 // Assigning serialNo based on order
    };
}).filter(Boolean);

console.log(JSON.stringify(students, null, 2));
