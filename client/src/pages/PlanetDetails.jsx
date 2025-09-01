import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, Button, Chip, Divider,
  Tab, Tabs, ImageList, ImageListItem, ImageListItemBar, IconButton,
  Accordion, AccordionSummary, AccordionDetails, Paper, List, ListItem,
  ListItemIcon, ListItemText, Avatar, Tooltip, CardMedia, LinearProgress
} from '@mui/material';
import {
  ArrowBack, OpenInNew, ExpandMore, School, Science, Timeline,
  PhotoLibrary, Info, Assessment, Visibility, Download,
  Speed, Thermostat, WbSunny, Public, Schedule, Straighten
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Comprehensive planet data
const planetData = {
  mercury: {
    name: "Mercury",
    type: "terrestrial_planet",
    description: "The smallest planet in our solar system and the one closest to the Sun, Mercury is only slightly larger than Earth's Moon.",
    basicStats: {
      diameter: "4,879 km",
      mass: "3.3011×10²³ kg",
      gravity: "3.7 m/s²",
      dayLength: "1,408 hours",
      yearLength: "88 Earth days",
      distanceFromSun: "57.9 million km",
      temperature: "-173°C to 427°C",
      moons: "0",
      atmosphere: "Practically none"
    },
    formation: {
      age: "4.6 billion years",
      formation: "Mercury formed about 4.6 billion years ago from the solar nebula, like other planets. Its proximity to the Sun meant that lighter elements were blown away, leaving behind a dense, rocky core.",
      evolution: "Early in its history, Mercury likely had a thicker crust, but intense bombardment and solar radiation stripped away much of its outer layers."
    },
    physicalCharacteristics: [
      "Mercury has a large iron core that makes up about 75% of the planet's radius",
      "Its surface is heavily cratered, similar to Earth's Moon",
      "The Caloris Basin is one of the largest impact craters in the solar system",
      "Mercury has no atmosphere to speak of, just traces of oxygen, sodium, hydrogen, helium, and potassium",
      "Surface temperatures vary more than any other planet in the solar system"
    ],
    history: [
      {
        period: "Ancient Times",
        description: "Known to ancient civilizations as both a morning and evening star, not realizing it was the same object."
      },
      {
        period: "1639",
        description: "First telescopic observations by Giovanni Zupi, confirming it orbits the Sun."
      },
      {
        period: "1974-1975",
        description: "Mariner 10 becomes the first spacecraft to visit Mercury, mapping 45% of the surface."
      },
      {
        period: "2011-2015",
        description: "MESSENGER spacecraft orbits Mercury, mapping the entire planet and discovering water ice at the poles."
      },
      {
        period: "2018-Present",
        description: "BepiColombo mission launched to study Mercury's composition and magnetic field in detail."
      }
    ],
    funFacts: [
      "A year on Mercury is only 88 Earth days, but a day lasts 176 Earth days",
      "Mercury is the second densest planet in the solar system after Earth",
      "Despite being closest to the Sun, Mercury has water ice in permanently shadowed craters at its poles",
      "Mercury's orbit is so eccentric that the Sun appears to move backwards in the sky at times",
      "The temperature difference between Mercury's day and night sides is about 600°C"
    ],
    missions: [
      {
        name: "Mariner 10",
        year: "1974-1975",
        achievement: "First Mercury flyby mission, photographed 45% of surface"
      },
      {
        name: "MESSENGER",
        year: "2004-2015",
        achievement: "First to orbit Mercury, complete surface mapping, discovered water ice"
      },
      {
        name: "BepiColombo",
        year: "2018-2025",
        achievement: "Joint ESA-JAXA mission for detailed study of Mercury's interior and magnetosphere"
      }
    ],
    gallery: [
      {
        url: "https://science.nasa.gov/wp-content/uploads/2024/03/pia15162-mercury-basins-messenger-16x9-1.jpg?resize=1200,675",
        title: "Mercury's Cratered Surface",
        description: "Mercury's heavily cratered surface resembles Earth's Moon"
      },
      {
        url: "https://cdn.mos.cms.futurecdn.net/3L2GqSaMr5ypERByKMK7wU.jpg",
        title: "Mercury Transit",
        description: "Mercury passing in front of the Sun as seen from Earth"
      },
      {
        url: "https://www.universetoday.com/article_images/Magnetosphere_rendition-1024x560.jpg",
        title: "Mercury's Magnetosphere",
        description: "Artist's impression of Mercury's magnetic field"
      }
    ]
  },
  venus: {
    name: "Venus",
    type: "terrestrial_planet",
    description: "Venus is the second planet from the Sun and is Earth's closest planetary neighbor. It's one of the four inner, terrestrial planets, and it's often called Earth's twin because it's similar in size and density.",
    basicStats: {
      diameter: "12,104 km",
      mass: "4.8675×10²⁴ kg",
      gravity: "8.87 m/s²",
      dayLength: "5,832 hours (retrograde)",
      yearLength: "225 Earth days",
      distanceFromSun: "108.2 million km",
      temperature: "462°C (surface)",
      moons: "0",
      atmosphere: "96% CO₂, 3.5% N₂, traces of SO₂"
    },
    formation: {
      age: "4.6 billion years",
      formation: "Venus formed from the same solar nebula as other planets, but its proximity to the Sun and thick atmosphere led to a runaway greenhouse effect.",
      evolution: "Venus may have once had oceans, but the greenhouse effect caused all water to evaporate, creating the hellish world we see today."
    },
    physicalCharacteristics: [
      "Venus has the densest atmosphere of any terrestrial planet",
      "Surface pressure is 90 times that of Earth",
      "Venus rotates backwards (retrograde) compared to most planets",
      "Its clouds are made of sulfuric acid",
      "Venus has over 1,600 major volcanoes",
      "The surface is hidden by thick clouds of sulfuric acid"
    ],
    history: [
      {
        period: "Ancient Times",
        description: "Venus was known to ancient civilizations as both the morning star (Phosphoros) and evening star (Hesperus)."
      },
      {
        period: "1610",
        description: "Galileo observed Venus's phases, providing evidence for the heliocentric model."
      },
      {
        period: "1962",
        description: "Mariner 2 becomes the first successful planetary flyby mission."
      },
      {
        period: "1970-1982",
        description: "Soviet Venera program lands multiple probes on Venus's surface."
      },
      {
        period: "1990-1994",
        description: "Magellan spacecraft maps Venus's surface using radar."
      }
    ],
    funFacts: [
      "Venus is the hottest planet in the solar system, hotter than Mercury",
      "A day on Venus is longer than its year",
      "Venus spins backwards compared to Earth",
      "Venus is often called Earth's 'evil twin'",
      "It rains sulfuric acid on Venus, but it evaporates before reaching the ground",
      "Venus is the brightest natural object in the night sky after the Moon"
    ],
    missions: [
      {
        name: "Venera Program",
        year: "1961-1984",
        achievement: "Soviet missions that first landed on Venus and sent back surface images"
      },
      {
        name: "Magellan",
        year: "1989-1994",
        achievement: "Mapped 98% of Venus's surface using radar"
      },
      {
        name: "Venus Express",
        year: "2005-2014",
        achievement: "ESA mission studying Venus's atmosphere and climate"
      }
    ],
    gallery: [
      {
        url: "https://science.nasa.gov/wp-content/uploads/2024/03/venus-mariner-10-pia23791-fig2-16x9-1.jpg?resize=1200,675",
        title: "Venus's Thick Atmosphere",
        description: "Venus shrouded in its thick, toxic atmosphere"
      },
      {
        url: "https://cdn.sci.esa.int/documents/34571/35316/1567217467486-PIA00160.jpg/1373ab2d-7005-61fc-4c4d-743a1cffb0a9?version=1.0&t=1567217467974",
        title: "Venus Surface Radar Map",
        description: "Radar mapping reveals Venus's volcanic surface"
      },
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCWM31Bl-Nh8aa_Eh1je-6HW8FjLVTHIDqFQ&s",
        title: "Venus Transit",
        description: "Venus crossing in front of the Sun"
      }
    ]
  },
  earth: {
    name: "Earth",
    type: "terrestrial-planet",
    description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth's surface is covered with water, mostly by oceans.",
    basicStats: {
      diameter: "12,756 km",
      mass: "5.972×10²⁴ kg",
      gravity: "9.8 m/s²",
      dayLength: "24 hours",
      yearLength: "365.25 days",
      distanceFromSun: "149.6 million km",
      temperature: "-89°C to 58°C",
      moons: "1 (Luna)",
      atmosphere: "78% N₂, 21% O₂, 1% other gases"
    },
    formation: {
      age: "4.54 billion years",
      formation: "Earth formed through accretion of dust and gas in the solar nebula, with the Moon likely forming from debris after a Mars-sized object collided with early Earth.",
      evolution: "Earth's early atmosphere was toxic, but photosynthesis by early life forms created the oxygen-rich atmosphere we have today."
    },
    physicalCharacteristics: [
      "Earth is the only known planet with plate tectonics",
      "71% of the surface is covered by water",
      "Earth has a strong magnetic field that protects us from solar radiation",
      "The atmosphere contains the perfect amount of greenhouse gases to support life",
      "Earth has one natural satellite, the Moon, which affects tides and climate"
    ],
    history: [
      {
        period: "4.54 billion years ago",
        description: "Earth forms from accretion of planetary material in the solar nebula."
      },
      {
        period: "4.4 billion years ago",
        description: "Earth's first oceans form as the planet cools."
      },
      {
        period: "3.8 billion years ago",
        description: "First signs of life appear in Earth's oceans."
      },
      {
        period: "2.4 billion years ago",
        description: "Great Oxidation Event - oxygen begins accumulating in the atmosphere."
      },
      {
        period: "540 million years ago",
        description: "Cambrian Explosion - rapid diversification of life forms."
      }
    ],
    funFacts: [
      "Earth is the only known planet with life",
      "Earth's core is as hot as the Sun's surface",
      "Earth is not a perfect sphere - it's slightly flattened at the poles",
      "The Moon is gradually moving away from Earth",
      "Earth has over 8.7 million species of life",
      "97% of Earth's water is in the oceans"
    ],
    missions: [
      {
        name: "Apollo Program",
        year: "1961-1975",
        achievement: "First humans to leave Earth and land on another celestial body"
      },
      {
        name: "International Space Station",
        year: "1998-Present",
        achievement: "Continuous human presence in space for over 20 years"
      },
      {
        name: "Earth Observation Satellites",
        year: "1960-Present",
        achievement: "Monitoring Earth's climate, weather, and environmental changes"
      }
    ],
    gallery: [
      {
        url: "https://science.nasa.gov/wp-content/uploads/2024/03/blue-marble-apollo-17-16x9-1.jpg?resize=1200,675",
        title: "Earth from Space",
        description: "The Blue Marble - Earth as seen from space"
      },
      {
        url: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/internal_resources/5054/5-Things-Moon_Comparison.jpg?w=1280&h=720&fit=clip&crop=faces%2Cfocalpoint",
        title: "Earth and Moon",
        description: "Earth and its natural satellite, the Moon"
      },
      {
        url: "https://eoimages.gsfc.nasa.gov/images/imagerecords/6000/6226/aurora_img_2005254.jpg",
        title: "Earth's Aurora",
        description: "Northern Lights caused by Earth's magnetosphere"
      }
    ]
  },
  mars: {
    name: "Mars",
    type: "terrestrial-planet",
    description: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury. Named after the Roman god of war, it is often referred to as the 'Red Planet'.",
    basicStats: {
      diameter: "6,792 km",
      mass: "6.4171×10²³ kg",
      gravity: "3.71 m/s²",
      dayLength: "24.6 hours",
      yearLength: "687 Earth days",
      distanceFromSun: "227.9 million km",
      temperature: "-87°C to -5°C",
      moons: "2 (Phobos and Deimos)",
      atmosphere: "95% CO₂, 3% N₂, 2% Ar"
    },
    formation: {
      age: "4.6 billion years",
      formation: "Mars formed in the outer part of the asteroid belt before migrating to its current position. Its smaller size meant it cooled faster than Earth.",
      evolution: "Mars likely had a thicker atmosphere and liquid water on its surface billions of years ago, but lost most of its atmosphere due to its weak magnetic field."
    },
    physicalCharacteristics: [
      "Mars has the largest volcano in the solar system, Olympus Mons",
      "Valles Marineris is a canyon system that stretches 4,000 km",
      "Mars has polar ice caps made of water and frozen carbon dioxide",
      "The red color comes from iron oxide (rust) on its surface",
      "Mars has seasons similar to Earth due to its axial tilt",
      "Evidence suggests Mars once had flowing water"
    ],
    history: [
      {
        period: "Ancient Times",
        description: "Mars was observed by ancient civilizations and named after gods of war due to its red color."
      },
      {
        period: "1877",
        description: "Giovanni Schiaparelli maps Mars and observes 'canali' (channels), mistranslated as 'canals'."
      },
      {
        period: "1965",
        description: "Mariner 4 provides first close-up images of Mars."
      },
      {
        period: "1976",
        description: "Viking 1 and 2 land on Mars, search for signs of life."
      },
      {
        period: "1997-Present",
        description: "Continuous exploration with rovers and orbiters studying Mars's potential for past life."
      }
    ],
    funFacts: [
      "Mars has the largest dust storms in the solar system",
      "A day on Mars is almost the same length as a day on Earth",
      "Mars has two small moons that are likely captured asteroids",
      "The first meteorite known to come from Mars was found in Antarctica",
      "Mars has four seasons like Earth, but they last twice as long",
      "The highest mountain on Mars is three times taller than Mount Everest"
    ],
    missions: [
      {
        name: "Viking Program",
        year: "1975-1982",
        achievement: "First successful Mars landers, searched for signs of life"
      },
      {
        name: "Mars Pathfinder/Sojourner",
        year: "1996-1997",
        achievement: "First Mars rover mission, proved rovers could work on Mars"
      },
      {
        name: "Mars Exploration Rovers",
        year: "2003-2018",
        achievement: "Spirit and Opportunity rovers found evidence of past water activity"
      },
      {
        name: "Curiosity/Perseverance",
        year: "2011-Present",
        achievement: "Advanced rovers studying Mars's habitability and searching for life"
      }
    ],
    gallery: [
      {
        url: "https://science.nasa.gov/wp-content/uploads/2024/03/mars-full-globe-16x9-1.jpg?resize=1200,675",
        title: "Mars Surface",
        description: "The red, rocky surface of Mars"
      },
      {
        url: "https://cdn.mos.cms.futurecdn.net/FgDxtn3qXx4vf8AHj2NYGm.jpg",
        title: "Olympus Mons",
        description: "The largest volcano in the solar system"
      },
      {
        url: "https://preview.redd.it/oop5spv13a591.jpg?auto=webp&s=cd542ee7909e452d9c613e7cbbc5bccacdf392d5",
        title: "Mars Polar Ice Cap",
        description: "Seasonal ice cap at Mars's south pole"
      }
    ]
  },
  jupiter: {
    name: "Jupiter",
    type: "gas_giant",
    description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets in the Solar System combined.",
    basicStats: {
      diameter: "142,984 km",
      mass: "1.898×10²⁷ kg",
      gravity: "24.79 m/s²",
      dayLength: "9.9 hours",
      yearLength: "11.8 Earth years",
      distanceFromSun: "778.5 million km",
      temperature: "-108°C (cloud tops)",
      moons: "95+ (4 major Galilean moons)",
      atmosphere: "89% H₂, 10% He, 1% other gases"
    },
    formation: {
      age: "4.6 billion years",
      formation: "Jupiter was likely the first planet to form, capturing most of the remaining gas and dust in the solar nebula after the Sun formed.",
      evolution: "Jupiter may have migrated inward toward the Sun before moving back out, shaping the architecture of our solar system."
    },
    physicalCharacteristics: [
      "Jupiter is more massive than all other planets combined",
      "The Great Red Spot is a storm larger than Earth that has raged for centuries",
      "Jupiter has a faint ring system discovered in 1979",
      "Jupiter acts as a 'cosmic vacuum cleaner,' protecting inner planets from asteroids",
      "Jupiter has at least 95 moons, including four large Galilean moons",
      "Jupiter radiates more heat than it receives from the Sun"
    ],
    history: [
      {
        period: "Ancient Times",
        description: "Jupiter was known to ancient astronomers as the 'wandering star' and named after the king of Roman gods."
      },
      {
        period: "1610",
        description: "Galileo discovers Jupiter's four largest moons, proving not everything orbits Earth."
      },
      {
        period: "1973-1974",
        description: "Pioneer 10 and 11 become first spacecraft to visit Jupiter."
      },
      {
        period: "1979",
        description: "Voyager 1 and 2 reveal Jupiter's rings and detailed images of its moons."
      },
      {
        period: "1995-2003",
        description: "Galileo orbiter provides detailed study of Jupiter and its moons."
      }
    ],
    funFacts: [
      "Jupiter could fit all the other planets inside it",
      "Jupiter has the shortest day of all the planets",
      "Jupiter's moon Europa may have twice as much water as Earth's oceans",
      "Jupiter failed to become a star - it needed to be 80 times more massive",
      "Jupiter's Great Red Spot is shrinking",
      "Jupiter has been hit by comets, including Shoemaker-Levy 9 in 1994"
    ],
    missions: [
      {
        name: "Pioneer 10/11",
        year: "1972-1973",
        achievement: "First spacecraft to visit Jupiter and traverse the asteroid belt"
      },
      {
        name: "Voyager 1/2",
        year: "1977-1979",
        achievement: "Discovered Jupiter's rings and detailed study of Galilean moons"
      },
      {
        name: "Galileo",
        year: "1989-2003",
        achievement: "First Jupiter orbiter, discovered subsurface ocean on Europa"
      },
      {
        name: "Juno",
        year: "2011-Present",
        achievement: "Studying Jupiter's interior, atmosphere, and magnetic field"
      }
    ],
    gallery: [
      {
        url: "https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946-16x9-1.jpg?resize=1200,675",
        title: "Jupiter's Great Red Spot",
        description: "The famous Great Red Spot storm on Jupiter"
      },
      {
        url: "https://www.thoughtco.com/thmb/gWwnS-gbxxbE-5Pf9tdFhlToZP0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Jupiter-and-moons-58b82f8c3df78c060e64eb8b.jpg",
        title: "Jupiter and its Moons",
        description: "Jupiter with its four largest Galilean moons"
      },
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmC0ciAKTmaZ-OnGamh4ZAEBmxBbL_kPRBsQ&s",
        title: "Jupiter's Atmospheric Bands",
        description: "Jupiter's distinctive atmospheric bands and zones"
      }
    ]
  },
  saturn: {
    name: "Saturn",
    type: "gas_giant",
    description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is famous for its prominent ring system, which is made mostly of ice particles with a smaller amount of rocky debris and dust.",
    basicStats: {
      diameter: "120,536 km",
      mass: "5.683×10²⁶ kg",
      gravity: "10.44 m/s²",
      dayLength: "10.7 hours",
      yearLength: "29.4 Earth years",
      distanceFromSun: "1.43 billion km",
      temperature: "-139°C (cloud tops)",
      moons: "146+ (including Titan and Enceladus)",
      atmosphere: "96% H₂, 3% He, 1% other gases"
    },
    formation: {
      age: "4.6 billion years",
      formation: "Saturn formed from the same solar nebula as Jupiter, but being further from the Sun, it captured less material and has a lower density.",
      evolution: "Saturn's rings may be relatively young, possibly formed from the destruction of a moon or comet within the last few hundred million years."
    },
    physicalCharacteristics: [
      "Saturn is the least dense planet - it would float in water",
      "Saturn's rings span up to 282,000 km but are only about 10 meters thick",
      "Saturn has over 146 confirmed moons",
      "Titan, Saturn's largest moon, has a thick atmosphere and liquid methane lakes",
      "Enceladus shoots water geysers from its south pole",
      "Saturn's magnetic field is nearly perfectly aligned with its rotation axis"
    ],
    history: [
      {
        period: "Ancient Times",
        description: "Saturn was the farthest planet known to ancient astronomers and was associated with the god of agriculture."
      },
      {
        period: "1610",
        description: "Galileo first observes Saturn's rings but mistakes them for large moons."
      },
      {
        period: "1659",
        description: "Christiaan Huygens correctly identifies Saturn's rings and discovers Titan."
      },
      {
        period: "1979-1981",
        description: "Pioneer 11 and Voyager missions reveal detailed structure of Saturn's rings."
      },
      {
        period: "2004-2017",
        description: "Cassini mission provides unprecedented detail about Saturn, its rings, and moons."
      }
    ],
    funFacts: [
      "Saturn's rings are made of billions of ice and rock particles",
      "Saturn is less dense than water and would float if there were an ocean large enough",
      "One day on Saturn is only 10.7 hours, but a year lasts 29 Earth years",
      "Saturn's moon Titan has thicker atmosphere than Earth",
      "Saturn's hexagonal storm at its north pole is larger than Earth",
      "The Cassini spacecraft deliberately crashed into Saturn in 2017"
    ],
    missions: [
      {
        name: "Pioneer 11",
        year: "1979",
        achievement: "First spacecraft to visit Saturn and study its rings"
      },
      {
        name: "Voyager 1 & 2",
        year: "1980-1981",
        achievement: "Detailed images of Saturn's rings and discovery of new moons"
      },
      {
        name: "Cassini-Huygens",
        year: "2004-2017",
        achievement: "13-year mission studying Saturn system, landed probe on Titan"
      }
    ],
    gallery: [
      {
        url: "https://external-preview.redd.it/nhecArvQ9i2PxMLuPHN3WbfJcciUuBcilZmCXnh9QVM.jpg?auto=webp&s=93262463114e0b829e0253c73101953e948f1ccc",
        title: "Saturn's Magnificent Rings",
        description: "Saturn's iconic ring system in all its glory"
      },
      {
        url: "https://external-preview.redd.it/cold-water-thrown-on-hope-of-life-in-ocean-of-saturns-icy-v0--xerhPwX6twoLBqqf_yIzrcA-Vm2QXSOvU3nA025qS4.jpg?auto=webp&s=740435c220217a5b72229935c237797f1f43b130",
        title: "Saturn and Titan",
        description: "Saturn with its largest moon, Titan"
      },
      {
        url: "https://i.redd.it/7u0syr27ezfb1.jpg",
        title: "Saturn's Hexagon",
        description: "The mysterious hexagonal storm at Saturn's north pole"
      }
    ]
  },
  uranus: {
    name: "Uranus",
    type: "ice_giant",
    description: "Uranus is the seventh planet from the Sun and is unique among planets in our solar system because it rotates on its side. It's an ice giant composed mainly of water, methane, and ammonia ices.",
    basicStats: {
      diameter: "51,118 km",
      mass: "8.681×10²⁵ kg",
      gravity: "8.87 m/s²",
      dayLength: "17.2 hours",
      yearLength: "84 Earth years",
      distanceFromSun: "2.87 billion km",
      temperature: "-197°C",
      moons: "27+ (including Titania and Oberon)",
      atmosphere: "83% H₂, 15% He, 2% CH₄"
    },
    formation: {
      age: "4.6 billion years",
      formation: "Uranus likely formed closer to the Sun before migrating outward. Its unusual tilt may be due to a collision with an Earth-sized object.",
      evolution: "Uranus has the coldest planetary atmosphere in the solar system, despite not being the farthest from the Sun."
    },
    physicalCharacteristics: [
      "Uranus rotates on its side with an axial tilt of 98 degrees",
      "Uranus has a faint ring system, discovered in 1977",
      "The planet appears blue-green due to methane in its atmosphere",
      "Uranus has extreme seasons lasting 21 Earth years each",
      "Uranus has a weak magnetic field tilted 59 degrees from its rotation axis",
      "Uranus is the coldest planetary atmosphere in the solar system"
    ],
    history: [
      {
        period: "1781",
        description: "William Herschel discovers Uranus, the first planet found with a telescope."
      },
      {
        period: "1787-1851",
        description: "Herschel and others discover Uranus's largest moons: Titania, Oberon, Ariel, Umbriel, and Miranda."
      },
      {
        period: "1977",
        description: "Uranus's ring system is discovered by accident during observations of a stellar occultation."
      },
      {
        period: "1986",
        description: "Voyager 2 becomes the only spacecraft to visit Uranus, discovering 10 new moons."
      }
    ],
    funFacts: [
      "Uranus was the first planet discovered with a telescope",
      "A season on Uranus lasts 21 Earth years",
      "Uranus rotates on its side, possibly due to an ancient collision",
      "Uranus has the most inclined magnetic field of any planet",
      "Uranus is made of water, methane, and ammonia ices over a small rocky core",
      "The planet was almost named 'George' after King George III"
    ],
    missions: [
      {
        name: "Voyager 2",
        year: "1986",
        achievement: "Only spacecraft to visit Uranus, discovered 10 moons and studied magnetic field"
      }
    ],
    gallery: [
      {
        url: "https://science.nasa.gov/wp-content/uploads/2024/03/uranus-pia18182-16x9-1.jpg?resize=1200,675",
        title: "Uranus in True Color",
        description: "Uranus showing its distinctive blue-green color"
      },
      {
        url: "https://cdn.britannica.com/84/145484-050-B49C232F/image-Uranus-moons-camera-Voyager-2-smallest.jpg",
        title: "Uranus and its Moons",
        description: "Uranus with some of its 27 known moons"
      },
      {
        url: "https://researchmatters.in/sites/researchmatters.in/files/styles/large_800w_scale/public/jupiter.png?itok=HyABnInB",
        title: "Uranus Ring System",
        description: "The faint rings of Uranus discovered in 1977"
      }
    ]
  },
  neptune: {
    name: "Neptune",
    type: "ice_giant",
    description: "Neptune is the eighth and outermost known planet from the Sun. It's a dynamic planet with the fastest winds in the solar system, reaching speeds of up to 2,100 kilometers per hour.",
    basicStats: {
      diameter: "49,528 km",
      mass: "1.024×10²⁶ kg",
      gravity: "11.15 m/s²",
      dayLength: "16.1 hours",
      yearLength: "165 Earth years",
      distanceFromSun: "4.5 billion km",
      temperature: "-201°C",
      moons: "16+ (including Triton)",
      atmosphere: "80% H₂, 19% He, 1% CH₄"
    },
    formation: {
      age: "4.6 billion years",
      formation: "Neptune formed in the outer solar system and may have migrated outward from closer to the Sun during the solar system's early history.",
      evolution: "Neptune's largest moon Triton was likely a captured Kuiper Belt object, orbiting backward around the planet."
    },
    physicalCharacteristics: [
      "Neptune has the fastest winds in the solar system, up to 2,100 km/h",
      "Neptune's deep blue color comes from methane in its atmosphere",
      "The Great Dark Spot was a storm system larger than Earth",
      "Neptune has 16 known moons, with Triton being by far the largest",
      "Triton is the only large moon in the solar system that orbits backward",
      "Neptune radiates 2.6 times more energy than it receives from the Sun"
    ],
    history: [
      {
        period: "1846",
        description: "Neptune is discovered through mathematical predictions by Urbain Le Verrier and John Couch Adams."
      },
      {
        period: "1846",
        description: "Triton, Neptune's largest moon, is discovered just 17 days after the planet."
      },
      {
        period: "1949",
        description: "Nereid, Neptune's second-largest moon, is discovered."
      },
      {
        period: "1989",
        description: "Voyager 2 becomes the only spacecraft to visit Neptune, discovering 6 new moons and rings."
      },
      {
        period: "2011",
        description: "Neptune completes its first full orbit since its discovery 165 years earlier."
      }
    ],
    funFacts: [
      "Neptune was the first planet discovered through mathematical prediction",
      "One year on Neptune equals 165 Earth years",
      "Neptune's moon Triton orbits backwards and is gradually spiraling into the planet",
      "Neptune has supersonic winds despite being so far from the Sun",
      "Neptune's Great Dark Spot disappeared and new storms have formed since",
      "Neptune has completed only one orbit around the Sun since its discovery"
    ],
    missions: [
      {
        name: "Voyager 2",
        year: "1989",
        achievement: "Only spacecraft to visit Neptune, studied its atmosphere, rings, and moons"
      }
    ],
    gallery: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg",
        title: "Neptune's Deep Blue",
        description: "Neptune's distinctive deep blue color from methane"
      },
      {
        url: "https://cdn.mos.cms.futurecdn.net/VN8RpsrDfqQn5iQ85YWg43.jpg",
        title: "Neptune and Triton",
        description: "Neptune with its largest moon Triton"
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Neptune_storms.jpg/640px-Neptune_storms.jpg",
        title: "Neptune's Storms",
        description: "The dynamic storm systems of Neptune"
      }
    ]
  },
  sun: {
    name: "The Sun",
    type: "star",
    description: "The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.",
    basicStats: {
      diameter: "1,391,000 km",
      mass: "1.989×10³⁰ kg",
      gravity: "274 m/s²",
      dayLength: "25-35 days (varies by latitude)",
      yearLength: "225-250 million years (galactic orbit)",
      distanceFromEarth: "149.6 million km",
      temperature: "5,778 K (surface), 15 million K (core)",
      moons: "8 planets, 5 dwarf planets, countless asteroids",
      composition: "73% H, 25% He, 2% other elements"
    },
    formation: {
      age: "4.6 billion years",
      formation: "The Sun formed from the gravitational collapse of a region within a large molecular cloud, triggering nuclear fusion in its core.",
      evolution: "The Sun is currently in its main sequence phase and will continue burning hydrogen for about 5 billion more years before becoming a red giant."
    },
    physicalCharacteristics: [
      "The Sun contains 99.86% of the Solar System's mass",
      "Nuclear fusion in the core converts 600 million tons of hydrogen to helium every second",
      "The Sun's surface temperature is about 5,778 K (5,505°C)",
      "Solar wind extends throughout the Solar System",
      "The Sun has an 11-year magnetic activity cycle",
      "Solar flares and coronal mass ejections can affect Earth"
    ],
    history: [
      {
        period: "Ancient Times",
        description: "The Sun was worshipped by many ancient civilizations as a deity."
      },
      {
        period: "1610",
        description: "Galileo first observes sunspots through a telescope."
      },
      {
        period: "1920s",
        description: "Arthur Eddington proposes that the Sun is powered by nuclear fusion."
      },
      {
        period: "1930s-1950s",
        description: "Hans Bethe works out the details of nuclear fusion in stars."
      },
      {
        period: "1960s-Present",
        description: "Space-based solar observation missions provide detailed study of the Sun."
      }
    ],
    funFacts: [
      "The Sun is 109 times wider than Earth",
      "Light from the Sun takes 8 minutes and 20 seconds to reach Earth",
      "The Sun's core is 27 million degrees Fahrenheit",
      "The Sun loses 4 million tons of mass every second through nuclear fusion",
      "One million Earths could fit inside the Sun",
      "The Sun orbits the Milky Way galaxy once every 225-250 million years"
    ],
    missions: [
      {
        name: "SOHO",
        year: "1995-Present",
        achievement: "Solar and Heliospheric Observatory studying the Sun's interior and atmosphere"
      },
      {
        name: "Parker Solar Probe",
        year: "2018-Present",
        achievement: "Closest approach to the Sun, studying solar corona and solar wind"
      },
      {
        name: "Solar Dynamics Observatory",
        year: "2010-Present",
        achievement: "High-resolution imaging of solar activity and magnetic fields"
      }
    ],
    gallery: [
      {
        url: "https://science.nasa.gov/wp-content/uploads/2023/05/sun-jpg.webp?w=628",
        title: "The Sun",
        description: "Our star, the Sun, source of all energy in our solar system"
      },
      {
        url: "https://images.squarespace-cdn.com/content/v1/59c3bad759cc68f757a465a3/1531082991716-SMIVWOO1UP25DHKA2ZAZ/solar+flares.jpg",
        title: "Solar Flare",
        description: "A massive solar flare erupting from the Sun's surface"
      },
      {
        url: "https://www.weather.gov/images/fsd/astro/Sun_sunspot.jpg",
        title: "Sunspots",
        description: "Dark sunspots on the Sun's surface showing magnetic activity"
      }
    ]
  }
};

function PlanetDetails() {
  const { planetName } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get planet data based on planetName
  const planetKey = planetName?.toLowerCase();
  const planet = planetData[planetKey];

  if (!planet) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth={false} sx={{ 
          textAlign: 'center', 
          px: { xs: 2, sm: 3, md: 4 },
          width: '100%'
        }}>
          <Typography variant="h4" sx={{ color: 'white', mb: 3 }}>
            Planet not found
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
            The planet "{planetName}" doesn't exist in our database.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/universe-explorer')}
            sx={{
              background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #4c63d2 100%)',
              }
            }}
          >
            Back to Universe Explorer
          </Button>
        </Container>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const StatCard = ({ icon, label, value }) => (
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 }, 
      textAlign: 'center',
      background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: 2,
      backdropFilter: 'blur(10px)',
      minHeight: { xs: '120px', sm: '140px' }
    }}>
      <Box sx={{ color: '#4c63d2', mb: 1 }}>{icon}</Box>
      <Typography variant="h6" sx={{ 
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
        wordBreak: 'break-word'
      }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ 
        color: '#94a3b8',
        fontSize: { xs: '0.7rem', sm: '0.75rem' }
      }}>
        {label}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      pb: 8,
      width: '100vw',
      px: { xs: 1, sm: 2, md: 3, lg: 4 },
      pt: { xs: 8, sm: 10, md: 12 }
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ 
              color: '#94a3b8', 
              mb: 3,
              '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Back to Home
          </Button>

          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Orbitron',
                background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                textShadow: '0 0 30px rgba(76, 99, 210, 0.5)',
                px: { xs: 0, sm: 0 },
                lineHeight: { xs: 1.2, sm: 1.1 }
              }}
            >
              {planet.name}
            </Typography>
            
            <Chip
              label={planet.type.replace('_', ' ').toUpperCase()}
              sx={{
                background: 'linear-gradient(135deg, #4c63d2 0%, #7c3aed 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 2,
                py: 1
              }}
            />
            
            <Typography
              variant="h6"
              sx={{
                color: '#94a3b8',
                mt: 3,
                maxWidth: { xs: '100%', sm: '600px', md: '800px' },
                mx: 'auto',
                lineHeight: 1.6,
                px: { xs: 1, sm: 0 }
              }}
            >
              {planet.description}
            </Typography>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                color: '#94a3b8',
                fontWeight: 'bold',
                minWidth: { xs: 'auto', sm: 'auto' },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                '&.Mui-selected': {
                  color: '#4c63d2'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#4c63d2'
              },
              '& .MuiTabs-scrollButtons': {
                color: '#94a3b8'
              }
            }}
          >
            <Tab icon={<Assessment />} label="Overview" />
            <Tab icon={<Timeline />} label="Formation & History" />
            <Tab icon={<Science />} label="Physical Properties" />
            <Tab icon={<Visibility />} label="Exploration" />
            <Tab icon={<PhotoLibrary />} label="Gallery" />
            <Tab icon={<School />} label="Fun Facts" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tabValue}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h4" sx={{ color: 'white', mb: 4, fontFamily: 'Orbitron' }}>
                  Quick Stats
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Straighten />} label="Diameter" value={planet.basicStats.diameter} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Speed />} label="Gravity" value={planet.basicStats.gravity} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Schedule />} label="Day Length" value={planet.basicStats.dayLength} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Public />} label="Year Length" value={planet.basicStats.yearLength} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<WbSunny />} label="Distance from Sun" value={planet.basicStats.distanceFromSun} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Thermostat />} label="Temperature" value={planet.basicStats.temperature} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Public />} label="Moons" value={planet.basicStats.moons} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Info />} label="Mass" value={planet.basicStats.mass} />
                  </Grid>
                </Grid>

                <Paper sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 3,
                  height: 'fit-content'
                }}>
                  <Typography variant="h5" sx={{ 
                    color: 'white', 
                    mb: 3, 
                    fontFamily: 'Orbitron',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                  }}>
                    Atmospheric Composition
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#e2e8f0', 
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, 
                    lineHeight: 1.6 
                  }}>
                    {planet.basicStats.atmosphere}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Formation & History Tab */}
            {tabValue === 1 && (
              <Box>
                <Grid container spacing={{ xs: 3, md: 4 }}>
                  <Grid item xs={12} lg={6}>
                    <Paper sx={{
                      p: 4,
                      background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: 3,
                      height: 'fit-content'
                    }}>
                      <Typography variant="h5" sx={{ color: 'white', mb: 3, fontFamily: 'Orbitron' }}>
                        Formation
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#e2e8f0', mb: 2, fontSize: '1rem' }}>
                        <strong>Age:</strong> {planet.formation.age}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#e2e8f0', mb: 3, lineHeight: 1.6 }}>
                        {planet.formation.formation}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#e2e8f0', lineHeight: 1.6 }}>
                        {planet.formation.evolution}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} lg={6}>
                    <Typography variant="h5" sx={{ color: 'white', mb: 3, fontFamily: 'Orbitron' }}>
                      Historical Timeline
                    </Typography>
                    {planet.history.map((event, index) => (
                      <Paper key={index} sx={{
                        p: { xs: 2, sm: 3 },
                        mb: 2,
                        background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: 2,
                        borderLeft: '4px solid #4c63d2'
                      }}>
                        <Typography variant="h6" sx={{ color: '#4c63d2', mb: 1, fontWeight: 'bold' }}>
                          {event.period}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.5 }}>
                          {event.description}
                        </Typography>
                      </Paper>
                    ))}
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Physical Properties Tab */}
            {tabValue === 2 && (
              <Box>
                <Paper sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 4, fontFamily: 'Orbitron' }}>
                    Physical Characteristics
                  </Typography>
                  <List>
                    {planet.physicalCharacteristics.map((characteristic, index) => (
                      <ListItem key={index} sx={{ pb: 2 }}>
                        <ListItemIcon>
                          <Science sx={{ color: '#4c63d2' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={characteristic}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: '#e2e8f0',
                              fontSize: '1.05rem',
                              lineHeight: 1.6
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}

            {/* Exploration Tab */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h5" sx={{ color: 'white', mb: 4, fontFamily: 'Orbitron' }}>
                  Space Missions
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {planet.missions.map((mission, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                      <Paper sx={{
                        p: { xs: 2, sm: 3 },
                        height: '100%',
                        background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: 3,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(76, 99, 210, 0.3)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: '#4c63d2', 
                            mr: 2,
                            width: 40,
                            height: 40
                          }}>
                            🚀
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                              {mission.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {mission.year}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.6 }}>
                          {mission.achievement}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Gallery Tab */}
            {tabValue === 4 && (
              <Box>
                <Typography variant="h5" sx={{ color: 'white', mb: 4, fontFamily: 'Orbitron' }}>
                  Image Gallery
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {planet.gallery.map((image, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={index}>
                      <Paper sx={{
                        overflow: 'hidden',
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(76, 99, 210, 0.3)'
                        }
                      }}>
                        <CardMedia
                          component="img"
                          height="250"
                          image={image.url}
                          alt={image.title}
                          sx={{ 
                            objectFit: 'cover',
                            filter: 'brightness(0.9)',
                            height: { xs: '200px', sm: '250px' }
                          }}
                        />
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 'bold' }}>
                            {image.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>
                            {image.description}
                          </Typography>
                          <Button
                            startIcon={<Download />}
                            size="small"
                            sx={{
                              mt: 2,
                              color: '#4c63d2',
                              '&:hover': { backgroundColor: 'rgba(76, 99, 210, 0.1)' }
                            }}
                          >
                            Download
                          </Button>
                        </CardContent>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Fun Facts Tab */}
            {tabValue === 5 && (
              <Box>
                <Typography variant="h5" sx={{ color: 'white', mb: 4, fontFamily: 'Orbitron' }}>
                  Fun Facts About {planet.name}
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {planet.funFacts.map((fact, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Paper sx={{
                        p: { xs: 2, sm: 3 },
                        background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: 3,
                        borderLeft: '4px solid #7c3aed',
                        height: '100%',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: '#7c3aed', 
                            width: 30, 
                            height: 30,
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }}>
                            {index + 1}
                          </Avatar>
                          <Typography variant="body1" sx={{ 
                            color: '#e2e8f0', 
                            lineHeight: 1.6,
                            fontSize: '1rem'
                          }}>
                            {fact}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Box>
  );
}

export default PlanetDetails;