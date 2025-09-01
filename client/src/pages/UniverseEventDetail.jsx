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
      "https://i.pinimg.com/originals/ef/62/15/ef62159fccabc474c22cdc6c73d36736.gif",
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
      "https://www.earth.com/assets/_next/image/?url=https%3A%2F%2Fcff2.earth.com%2Fuploads%2F2025%2F08%2F04085114%2FUniverse-first-molecule-1400x850.jpg&w=1200&q=75",
      "https://nsf-gov-resources.nsf.gov/styles/featured_news/s3/2022-11/distantstar.jpg?VersionId=G4RMLj.T072pQVhAGbVeoND75fmDBZqv&itok=vEmw56oA",
      "https://res.cloudinary.com/jerrick/image/upload/c_scale,f_jpg,q_auto/6880ce4e201d90001d606411.webp",
      "https://cdn.britannica.com/50/62750-050-C12B4D5F/evolution.jpg"
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
      "https://www.cfa.harvard.edu/sites/default/files/styles/max_650x650/public/2019-04/WhyGalaxiesDiffer_2.jpg?itok=rr6RSnd1",
      "https://scx2.b-cdn.net/gfx/news/hires/2011/milkyway.jpg",
      "https://www.science.org/do/10.1126/science.z6r95kt/full/_20240521_nid_too_many_galaxies-1716411514473.jpg",
      "https://images.theconversation.com/files/394/original/See_Explanation._Clicking_on_the_picture_will_download_the_highest_resolution_version_available.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=926&fit=clip",
      "https://cdn.britannica.com/47/111347-050-F03ABE95/cluster-M80-image-Hubble-Space-Telescope-hundreds.jpg"
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
      "https://cdn.mos.cms.futurecdn.net/v5n22xGyNNHLzSnSArbrVH-1200-80.jpg",
      "https://media.sketchfab.com/models/febde2b6e3f64b06965620fd3ddc97c2/thumbnails/781c37830a844e2db8c6cd2dfbaaddec/6a7daa7b99c0480f92c7090cb690ea58.jpeg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/The_Mysterious_Case_of_the_Disappearing_Dust.jpg/1200px-The_Mysterious_Case_of_the_Disappearing_Dust.jpg",
      "https://orbitaltoday.com/wp-content/uploads/2025/04/Solar-System-formation.jpg"
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
      "https://tvfinternational.com/assets/Uploads/_resampled/FillWyIxOTAwIiwiMTAwMCJd/Birth-of-Planet-Earth.png",
      "https://images.newscientist.com/wp-content/uploads/2014/06/dn25702-1_800.jpg",
      "https://i.makeagif.com/media/8-20-2016/S6q6-6.gif",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwkyYLllsr4U6BUGMYKsQIoazSk-qkJ42bvA&s"
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
      "https://i.natgeofe.com/n/a339c30c-5df1-4cf3-b07d-7321fd40e878/C0580555-Early_Earth_illustration.jpg",
      "https://cdn.images.express.co.uk/img/dynamic/151/590x/evolution-809313.jpg?r=1686998680160",
      "https://www.scienceinschool.org/wp-content/uploads/2020/01/issue49_lifeonearth_protocells.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyDOiu7qjd6Mfrfdadz_eiuh1X7F6ghizThA&s"
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
      "https://singularityhub.com/uploads/2021/12/ancient_humans_hunting_woolly_mammoth.jpeg?auto=webp&auto=webp&optimize=high&quality=70&width=1440",
      "https://scitechdaily.com/images/Reconstruction-of-Ancient-Human-in-Lazaret-Cave.jpg",
      "https://thumbs.dreamstime.com/b/prehistoric-scene-depicting-group-early-humans-engaged-activities-inside-cave-entrance-some-working-stone-379846685.jpg",
      "https://images.nationalgeographic.org/image/upload/t_edhub_resource_key_image/v1638890289/EducationHub/photos/assyria.jpg"
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
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKrkCnpe4GR7mJV9o9rF-EAblVyp9E57rJkg&s",
      "https://cdn.britannica.com/98/78098-050-7998488E/Astronauts-John-Grunsfeld-space-shuttle-Richard-Linnehan-March-8-2002.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX_ec8WxQh-y9JehCchKH39Ni_ifsjYvXVLQ&s",
      "https://cdn.mos.cms.futurecdn.net/2rzDuuKcnCjrLPrZnPE4qE.jpg",
      "https://space.skyrocket.de/img_lau/starship_b9-s25__2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/d/d6/STS120LaunchHiRes-edit1.jpg",
      "https://c.ndtvimg.com/gws/ms/10-fascinating-facts-about-international-space-station/assets/6.jpeg?1740329430"
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