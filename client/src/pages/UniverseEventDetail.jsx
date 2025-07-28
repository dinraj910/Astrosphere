import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardMedia, Chip, Stack, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const eventDetails = [
  {
    title: "The Big Bang",
    emoji: "💥",
    mainImage: "https://cdn.hswstatic.com/gif/before-big-bang-3.jpg",
    description: `The Big Bang marks the birth of our universe, about 13.8 billion years ago. In a fraction of a second, all matter, energy, space, and time erupted from a singularity—an infinitely hot, dense point. This event set the stage for everything: the laws of physics, the formation of atoms, and the cosmic expansion that continues today. 
    After the initial explosion, the universe cooled rapidly, allowing subatomic particles to form. Within minutes, protons and neutrons fused into the first atomic nuclei. For hundreds of thousands of years, the universe was a hot, opaque soup, until it cooled enough for atoms to form and light to travel freely. This ancient light, the cosmic microwave background, is still detectable today. The Big Bang is not just an explosion, but the beginning of space and time itself.`,
    facts: [
      "The universe began as a singularity.",
      "All space, time, matter, and energy originated here.",
      "Cosmic microwave background is the Big Bang's afterglow.",
      "The universe is still expanding.",
      "Fundamental forces (gravity, electromagnetism, etc.) emerged.",
      "First atoms formed about 380,000 years after the Big Bang.",
      "Estimated age: 13.8 billion years.",
    ],
    gallery: [
      "https://www.science-sparks.com/wp-content/uploads/2022/06/Big-Bang-Diagram-scaled.jpg",
      "https://earthsky.org/upl/2021/06/Big-Bang-Concept.gif",
      "https://media.istockphoto.com/id/177339031/photo/space-warp-travel-trough-universe.jpg?s=612x612&w=0&k=20&c=C6U7SHZwUFLxkB-LGPLCdCsaOMmyBodlrBm4lzjT44o=",
      "https://media.istockphoto.com/id/1365558184/photo/big-bang-explosion-time-warp-in-space-universe.jpg?s=612x612&w=0&k=20&c=1mYKwUpnYHS0FSmzz3axtB-lIXLJ5DGsYJSkuj9K99M="
    ],
    quote: "“If you want to make an apple pie from scratch, you must first invent the universe.” – Carl Sagan"
  },
  {
    title: "First Stars Ignite",
    emoji: "✨",
    mainImage: "https://blogs-images.forbes.com/startswithabang/files/2016/07/1-8e14TrRcyqPiHf9Cvy8dnw.jpeg",
    description: `Hundreds of millions of years after the Big Bang, the universe was dark and filled with hydrogen and helium. Gravity pulled these gases together, forming the first stars—massive, hot, and short-lived. Their nuclear fusion created heavier elements and flooded the cosmos with light, ending the cosmic "dark ages." These stars exploded as supernovae, scattering elements and triggering the formation of new stars and galaxies.`,
    facts: [
      "First stars formed about 200 million years after the Big Bang.",
      "They were much larger and hotter than most stars today.",
      "Fusion in stars created elements like carbon and oxygen.",
      "Their light reionized the universe, making it transparent.",
      "Supernova explosions seeded the cosmos with heavy elements.",
    ],
    gallery: [
      "https://cdn.mos.cms.futurecdn.net/2b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b-1200-80.jpg",
      "https://www.nasa.gov/sites/default/files/thumbnails/image/firststars.jpg",
      "https://www.eso.org/public/archives/images/screen/eso1907a.jpg"
    ],
    quote: "“We are made of star-stuff.” – Carl Sagan"
  },
  {
    title: "Galaxies Take Shape",
    emoji: "🌌",
    mainImage: "https://i.natgeofe.com/n/c5100908-bad2-4738-bb76-cfd2977156d1/75153.jpg",
    description: `Gravity continued its work, pulling stars together into vast, swirling galaxies. These cosmic cities contain billions of stars, clouds of gas and dust, and mysterious dark matter. Galaxies collided and merged, forming larger structures and shaping the universe's grand architecture. Spiral, elliptical, and irregular galaxies each tell a story of cosmic evolution.`,
    facts: [
      "Galaxies formed from gravitational collapse of matter.",
      "The Milky Way is a spiral galaxy with over 100 billion stars.",
      "Dark matter holds galaxies together.",
      "Galaxies merge and interact, changing their shapes.",
      "Supermassive black holes often reside at galaxy centers.",
    ],
    gallery: [
      "https://cdn.spacetelescope.org/archives/images/screen/heic1509a.jpg",
      "https://www.nasa.gov/sites/default/files/thumbnails/image/milkyway.jpg",
      "https://www.eso.org/public/archives/images/screen/eso1907a.jpg"
    ],
    quote: "“The cosmos is within us. We are made of star-stuff.” – Carl Sagan"
  },
  {
    title: "Our Solar System Forms",
    emoji: "☀️🪐",
    mainImage: "https://supernova.eso.org/static/archives/exhibitionimages/screen/0507_C_planet-formation.jpg",
    description: `About 4.6 billion years ago, a giant cloud of gas and dust collapsed under gravity, forming our Sun. The leftover material spun into a disk, where planets, moons, asteroids, and comets coalesced. Violent impacts and cosmic collisions shaped the solar system, creating the diverse worlds we know today.`,
    facts: [
      "The solar system formed from a solar nebula.",
      "The Sun contains 99.86% of the solar system's mass.",
      "Planets formed by accretion of dust and gas.",
      "Early solar system was chaotic, with frequent collisions.",
      "Comets and asteroids are leftover building blocks.",
    ],
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Solar_System_Formation.jpg",
      "https://www.nasa.gov/sites/default/files/thumbnails/image/solar_system_diagram.jpg",
      "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2015/02/planck_and_the_cosmic_microwave_background/15398413-1-eng-GB/Planck_and_the_cosmic_microwave_background_pillars.jpg"
    ],
    quote: "“Somewhere, something incredible is waiting to be known.” – Carl Sagan"
  },
  {
    title: "Birth of Earth",
    emoji: "🌍",
    mainImage: "https://www.shutterstock.com/shutterstock/videos/1079639573/thumb/1.jpg?ip=x480",
    description: `Earth formed about 4.54 billion years ago from the dust and gas left over after the Sun's birth. Intense heat and collisions melted the young planet, separating it into layers: core, mantle, and crust. Volcanic eruptions released gases, forming the atmosphere. Water arrived via comets and asteroids, setting the stage for life.`,
    facts: [
      "Earth formed from accretion of dust and rock.",
      "Early Earth was molten and bombarded by asteroids.",
      "Atmosphere formed from volcanic outgassing.",
      "Water arrived from icy comets and asteroids.",
      "Earth's magnetic field protects life from solar wind.",
    ],
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
      "https://www.nasa.gov/sites/default/files/thumbnails/image/earth_day_2021.jpg",
      "https://www.sciencealert.com/images/2020-04/processed/earth-blue-marble-nasa_1024.jpg"
    ],
    quote: "“Look again at that dot. That's here. That's home. That's us.” – Carl Sagan"
  },
  {
    title: "Life on Earth",
    emoji: "🌍🦠",
    mainImage: "https://naturalhistory.si.edu/sites/default/files/styles/resource_side/public/media/image/cambrian-depictionkaren-carrsmithsonianpd516x342.jpg.webp?itok=nXOqJn5h",
    description: `Life began in Earth's oceans over 3.5 billion years ago, starting with simple single-celled organisms. Over time, life evolved into complex forms—plants, animals, fungi, and more. Mass extinctions and evolutionary leaps shaped the diversity we see today. Life adapted to every environment, from deep oceans to mountaintops.`,
    facts: [
      "First life: single-celled organisms in oceans.",
      "Photosynthesis changed Earth's atmosphere.",
      "Cambrian explosion: rapid diversification of life.",
      "Mass extinctions reshaped life on Earth.",
      "Humans are a recent branch on the tree of life.",
    ],
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Cambrian_explosion.png",
      "https://www.nhm.ac.uk/content/dam/nhmwww/discover/cambrian-explosion/cambrian-explosion-full-width.jpg",
      "https://www.nasa.gov/sites/default/files/thumbnails/image/earth_life.jpg"
    ],
    quote: "“Life is the universe's way of knowing itself.” – Carl Sagan"
  },
  {
    title: "Humans Look Up",
    emoji: "👨‍🚀🔭",
    mainImage: "https://imageio.forbes.com/blogs-images/startswithabang/files/2018/03/astardisturb.jpg?format=jpg&height=600&width=1200&fit=bounds",
    description: `Humans evolved on Earth, developing curiosity and intelligence. We built tools, created art, and began to study the stars. Ancient civilizations tracked celestial movements, invented calendars, and wondered about our place in the cosmos. The invention of telescopes opened new windows to the universe, leading to discoveries that changed our understanding forever.`,
    facts: [
      "Humans have gazed at the stars for millennia.",
      "Ancient cultures built observatories and calendars.",
      "Telescopes revolutionized astronomy.",
      "We discovered planets, galaxies, and cosmic laws.",
      "Curiosity drives exploration and discovery.",
    ],
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/3/3a/Hubble_Space_Telescope.jpg",
      "https://www.nasa.gov/sites/default/files/thumbnails/image/astronaut-spacewalk.jpg",
      "https://cdn.mos.cms.futurecdn.net/2b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b-1200-80.jpg"
    ],
    quote: "“Somewhere, something incredible is waiting to be known.” – Carl Sagan"
  },
  {
    title: "Exploring the Cosmos",
    emoji: "🚀🌠",
    mainImage: "https://thumbs.dreamstime.com/b/men-space-exploring-cosmos-venture-vast-unknown-pushing-boundaries-human-exploration-310222912.jpg",
    description: `From the first rockets to interplanetary probes, humans have reached beyond Earth. We landed on the Moon, sent robots to Mars, and launched telescopes into deep space. Space exploration expands our knowledge, inspires new technology, and brings us closer to answering the biggest questions: Are we alone? What is our cosmic destiny?`,
    facts: [
      "Sputnik: first artificial satellite (1957).",
      "Apollo 11: first humans on the Moon (1969).",
      "Voyager probes have left the solar system.",
      "Mars rovers search for signs of life.",
      "James Webb Space Telescope explores the early universe.",
    ],
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Apollo_11_Lunar_Module_on_the_Moon.jpg",
      "https://mars.nasa.gov/system/news_items/main_images/9447_PIA25681-FigureA-web.jpg",
      "https://cdn.spacetelescope.org/archives/images/screen/heic1509a.jpg"
    ],
    quote: "“To confine our attention to terrestrial matters would be to limit the human spirit.” – Stephen Hawking"
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.7 }
  })
};

function UniverseEventDetail() {
  const { eventIndex } = useParams();
  const navigate = useNavigate();
  const event = eventDetails[eventIndex];

  if (!event) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h4">Event not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 260, md: 480 }, overflow: 'hidden', mb: 4 }}>
        <motion.img
          src={event.mainImage}
          alt={event.title}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7) blur(0.5px)'
          }}
        />
        <Box sx={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Typography variant="h2" sx={{
              color: 'white', fontFamily: 'Orbitron', textShadow: '0 0 24px #000, 0 0 8px #f472b6', mb: 1, textAlign: 'center'
            }}>
              {event.emoji} {event.title}
            </Typography>
          </motion.div>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="contained"
          color="secondary"
          sx={{ position: 'absolute', top: 24, left: 24, zIndex: 2 }}
          onClick={() => navigate('/universe-story')}
        >
          Back
        </Button>
      </Box>

      <Grid container spacing={6} sx={{ px: { xs: 2, md: 8 } }}>
        <Grid item xs={12} md={7}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            custom={1}
          >
            <Typography variant="h4" sx={{ fontFamily: 'Orbitron', mb: 2 }}>
              About this Event
            </Typography>
            <Typography variant="body1" sx={{ fontSize: 20, mb: 3, lineHeight: 1.7 }}>
              {event.description}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 2 }}>
              Key Facts
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              {event.facts.map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Chip
                    label={fact}
                    color="primary"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      fontSize: 16,
                      px: 2,
                      py: 2,
                      boxShadow: '0 2px 12px rgba(129,140,248,0.10)',
                      background: 'linear-gradient(90deg, #1b2735 0%, #818cf8 100%)',
                      color: 'white'
                    }}
                  />
                </motion.div>
              ))}
            </Stack>
            <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 4,fontSize: '20px' }}>
              <strong>{event.quote}</strong>
            </Typography>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={5}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            custom={2}
          >
            <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 2 }}>
              Gallery
            </Typography>
            <Grid container spacing={3}>
              {event.gallery.map((img, i) => (
                <Grid item xs={12} key={i}>
                  <Card
                    component={motion.div}
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 32px #818cf8' }}
                    sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 32px rgba(129,140,248,0.18)' }}
                  >
                    <CardMedia
                      component="img"
                      image={img}
                      alt={`Gallery ${i + 1}`}
                      sx={{ height: { xs: 220, md: 340 }, width: '100%', objectFit: 'cover' }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UniverseEventDetail;