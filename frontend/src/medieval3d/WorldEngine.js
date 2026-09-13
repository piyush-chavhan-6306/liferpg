import * as THREE from 'three'

/**
 * WorldEngine: Full Medieval 3D Cinematic Storytelling Universe
 *
 * Implements a connected, living 3D world:
 * 1. The Cosmic Void & Celestial Dome
 * 2. The Awakening Hero (Fully rendered 3D Knight with plate armor, cloak, & broadsword)
 * 3. The Mountain Road & Medieval Landscape (cobblestones, rocky crags, pine trees, lanterns)
 * 4. The Ancient Quest Board (carved timber, parchment notices, +50 XP / +20 Gold)
 * 5. The Blacksmith's Forge (stone furnace, glowing coals, anvil, sparks, Level Up aura)
 * 6. The Shrine of the Eternal Flame (living fire, floating streak rings 3/7/30 days)
 * 7. The Attribute Monoliths (Strength, Intellect, Discipline, Vitality obelisks with glowing runes)
 * 8. The Treasure Chamber (iron-banded chest, golden relics, gleaming treasure)
 * 9. The Grand Castle Fortress & Gates (twin bastions, crenellations, braziers, animated opening doors)
 */
export class WorldEngine {
  constructor(canvas) {
    this.canvas = canvas
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.scrollProgress = 0
    this.smoothScroll = 0
    this.clock = new THREE.Clock()
    this.isRunning = false
    this.animId = null

    // Door opening animation state on auth success
    this.doorsOpening = false
    this.doorOpenProgress = 0

    this.initScene()
    this.initLights()
    this.initMaterials()
    this.initCosmicVoid()
    this.initLandscapeAndRoad()
    this.initKnightCharacter()
    this.initQuestBoard()
    this.initBlacksmithForge()
    this.initEternalFlameShrine()
    this.initAttributeMonoliths()
    this.initTreasureVault()
    this.initCastleFortress()
    this.initEvents()
    this.start()
  }

  /* ----------------------------------------------------
   * Scene & Camera Initialization
   * ---------------------------------------------------- */
  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x06050b)
    // Volumetric exponential fog gives huge atmospheric depth
    this.scene.fog = new THREE.FogExp2(0x06050b, 0.014)

    this.camera = new THREE.PerspectiveCamera(52, this.width / this.height, 0.1, 800)
    this.camera.position.set(0, 2.2, 14)
    this.camera.lookAt(0, 1.4, 0)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    })

    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  /* ----------------------------------------------------
   * Atmospheric Lighting System
   * ---------------------------------------------------- */
  initLights() {
    // Ambient cosmic dusk
    this.ambientLight = new THREE.AmbientLight(0x1a162b, 1.0)
    this.scene.add(this.ambientLight)

    // Directional celestial moonlight (casts soft shadows over the journey)
    this.moonLight = new THREE.DirectionalLight(0x8fa8d6, 1.8)
    this.moonLight.position.set(-30, 45, 20)
    this.moonLight.castShadow = true
    this.moonLight.shadow.mapSize.width = 1024
    this.moonLight.shadow.mapSize.height = 1024
    this.moonLight.shadow.camera.near = 10
    this.moonLight.shadow.camera.far = 300
    this.moonLight.shadow.camera.left = -50
    this.moonLight.shadow.camera.right = 50
    this.moonLight.shadow.camera.top = 50
    this.moonLight.shadow.camera.bottom = -50
    this.scene.add(this.moonLight)

    // Warm roadside torch & forge lights along the road
    this.torchLights = []
  }

  addTorchLight(x, y, z, color = 0xff7b22, intensity = 2.5, distance = 18) {
    const light = new THREE.PointLight(color, intensity, distance, 1.6)
    light.position.set(x, y, z)
    this.scene.add(light)
    this.torchLights.push({ light, baseIntensity: intensity, x, y, z })
    return light
  }

  /* ----------------------------------------------------
   * Shared High-Quality Materials
   * ---------------------------------------------------- */
  initMaterials() {
    // Medieval dark stone material
    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1f1b29,
      roughness: 0.85,
      metalness: 0.15,
    })

    // Cobblestone road material
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x161320,
      roughness: 0.8,
      metalness: 0.2,
    })

    // Polished Knight plate armor (steel with subtle golden sheen)
    this.armorSteelMat = new THREE.MeshStandardMaterial({
      color: 0x6e7688,
      roughness: 0.25,
      metalness: 0.85,
    })

    // Gold trim on armor and crests
    this.armorGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd49b38,
      roughness: 0.3,
      metalness: 0.9,
    })

    // Knight's dark crimson / royal cape fabric
    this.capeMat = new THREE.MeshStandardMaterial({
      color: 0x5a1820,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
    })

    // Dark oak wood for quest board & gates
    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x241812,
      roughness: 0.75,
      metalness: 0.1,
    })

    // Weathered parchment material
    this.parchmentMat = new THREE.MeshStandardMaterial({
      color: 0xecd7b4,
      roughness: 0.6,
      metalness: 0.05,
    })

    // Glowing forge iron
    this.moltenMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
    })

    // Castle dark granite stone
    this.castleStoneMat = new THREE.MeshStandardMaterial({
      color: 0x14121d,
      roughness: 0.9,
      metalness: 0.2,
    })
  }

  /* ----------------------------------------------------
   * 1. Cosmic Void & Celestial Dome
   * ---------------------------------------------------- */
  initCosmicVoid() {
    this.voidGroup = new THREE.Group()
    this.scene.add(this.voidGroup)

    // Starfield (1,800 stars)
    const starCount = 1800
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)

    const colorGold = new THREE.Color(0xfde68a)
    const colorAzure = new THREE.Color(0xa5b4fc)
    const colorSilver = new THREE.Color(0xe2e8f0)

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const radius = 180 + Math.random() * 220
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      starPos[i3] = radius * Math.sin(phi) * Math.cos(theta)
      starPos[i3 + 1] = Math.abs(radius * Math.cos(phi)) + 5
      starPos[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 60

      const rnd = Math.random()
      const c = rnd > 0.65 ? colorGold : rnd > 0.3 ? colorAzure : colorSilver
      starColors[i3] = c.r
      starColors[i3 + 1] = c.g
      starColors[i3 + 2] = c.b
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMat = new THREE.PointsMaterial({
      size: 1.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      fog: false,
    })
    this.starfield = new THREE.Points(starGeo, starMat)
    this.voidGroup.add(this.starfield)

    // Atmospheric rising embers (500 particles)
    const emberCount = 500
    const emberGeo = new THREE.BufferGeometry()
    this.emberPositions = new Float32Array(emberCount * 3)
    this.emberVelocities = []

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3
      this.emberPositions[i3] = (Math.random() - 0.5) * 35
      this.emberPositions[i3 + 1] = Math.random() * 18 - 2
      this.emberPositions[i3 + 2] = (Math.random() - 0.5) * 60 + 5

      this.emberVelocities.push({
        y: 0.01 + Math.random() * 0.02,
        x: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005,
        swaySpeed: 1 + Math.random() * 2.5,
        swayAmp: 0.004 + Math.random() * 0.006,
      })
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(this.emberPositions, 3))
    const emberTexture = this.createCircleTexture('#ffbe3b', '#e64a19')
    const emberMat = new THREE.PointsMaterial({
      size: 0.38,
      map: emberTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffaa44,
    })
    this.embers = new THREE.Points(emberGeo, emberMat)
    this.voidGroup.add(this.embers)
  }

  /* ----------------------------------------------------
   * 2. Medieval Landscape & Road
   * ---------------------------------------------------- */
  initLandscapeAndRoad() {
    this.worldGroup = new THREE.Group()
    this.scene.add(this.worldGroup)

    // Continuous Mountain Terrain Plane (extends from Z = +30 down to Z = -260)
    const terrainGeo = new THREE.PlaneGeometry(120, 300, 36, 72)
    terrainGeo.rotateX(-Math.PI / 2)

    // Procedurally sculpt hills & mountain edges
    const pos = terrainGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      // Flatten the central road corridor (|x| < 4)
      const distFromRoad = Math.abs(x)
      if (distFromRoad > 4.5) {
        const hill = Math.sin(x * 0.15) * Math.cos(z * 0.08) * 4.5 + Math.pow(distFromRoad - 4, 1.25) * 0.35
        pos.setY(i, hill - 1.2)
      } else {
        // Subtle road crown
        pos.setY(i, -1.2 + (1 - distFromRoad / 4.5) * 0.15)
      }
    }
    terrainGeo.computeVertexNormals()

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x0a0911,
      roughness: 0.95,
      metalness: 0.1,
    })
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat)
    this.terrain.position.set(0, 0, -110)
    this.terrain.receiveShadow = true
    this.worldGroup.add(this.terrain)

    // The Cobblestone Road Ribbon
    const roadGeo = new THREE.PlaneGeometry(6.5, 290, 8, 80)
    roadGeo.rotateX(-Math.PI / 2)
    this.road = new THREE.Mesh(roadGeo, this.roadMat)
    this.road.position.set(0, -1.18, -110)
    this.road.receiveShadow = true
    this.worldGroup.add(this.road)

    // Roadside Curb Stones (left and right)
    this.createRoadsideCurbs()

    // Pine Trees & Medieval Vegetation along slopes
    this.createPineForest()

    // Roadside Stone Cairns & Torches
    this.createRoadsideLanterns()
  }

  createRoadsideCurbs() {
    const curbGeo = new THREE.BoxGeometry(0.35, 0.25, 1.5)
    for (let z = 20; z > -230; z -= 3.2) {
      // Left curb
      const curbL = new THREE.Mesh(curbGeo, this.stoneMat)
      curbL.position.set(-3.4 + (Math.sin(z * 0.1) * 0.15), -1.05, z)
      curbL.rotation.y = (Math.random() - 0.5) * 0.1
      this.worldGroup.add(curbL)

      // Right curb
      const curbR = new THREE.Mesh(curbGeo, this.stoneMat)
      curbR.position.set(3.4 + (Math.sin(z * 0.1) * 0.15), -1.05, z)
      curbR.rotation.y = (Math.random() - 0.5) * 0.1
      this.worldGroup.add(curbR)
    }
  }

  createPineForest() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.9 })
    const needleMat = new THREE.MeshStandardMaterial({ color: 0x09140f, roughness: 0.8 })

    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.8, 6)
    const cone1Geo = new THREE.ConeGeometry(1.8, 2.5, 6)
    const cone2Geo = new THREE.ConeGeometry(1.4, 2.2, 6)
    const cone3Geo = new THREE.ConeGeometry(0.9, 1.8, 6)

    for (let z = 15; z > -220; z -= 7) {
      // Tree on left
      const xLeft = -8 - Math.random() * 18
      this.addTree(xLeft, z + (Math.random() - 0.5) * 4, trunkGeo, cone1Geo, cone2Geo, cone3Geo, trunkMat, needleMat)

      // Tree on right
      const xRight = 8 + Math.random() * 18
      this.addTree(xRight, z + (Math.random() - 0.5) * 4, trunkGeo, cone1Geo, cone2Geo, cone3Geo, trunkMat, needleMat)
    }
  }

  addTree(x, z, trunkGeo, c1, c2, c3, tMat, nMat) {
    const tree = new THREE.Group()
    tree.position.set(x, -1.2, z)

    const trunk = new THREE.Mesh(trunkGeo, tMat)
    trunk.position.y = 1.4
    trunk.castShadow = true
    tree.add(trunk)

    const f1 = new THREE.Mesh(c1, nMat)
    f1.position.y = 3.0
    f1.castShadow = true
    tree.add(f1)

    const f2 = new THREE.Mesh(c2, nMat)
    f2.position.y = 4.4
    f2.castShadow = true
    tree.add(f2)

    const f3 = new THREE.Mesh(c3, nMat)
    f3.position.y = 5.6
    f3.castShadow = true
    tree.add(f3)

    const scale = 0.75 + Math.random() * 0.6
    tree.scale.set(scale, scale, scale)
    this.worldGroup.add(tree)
  }

  createRoadsideLanterns() {
    const lanternPostGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.2, 8)
    const lanternBoxGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4)
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xff9933 })

    const torchZLocations = [5, -15, -45, -80, -115, -150, -180, -195]

    torchZLocations.forEach((z, idx) => {
      const side = idx % 2 === 0 ? -3.8 : 3.8
      const lantern = new THREE.Group()
      lantern.position.set(side, -1.2, z)

      const post = new THREE.Mesh(lanternPostGeo, this.woodMat)
      post.position.y = 1.6
      lantern.add(post)

      const box = new THREE.Mesh(lanternBoxGeo, glassMat)
      box.position.y = 3.2
      lantern.add(box)

      this.worldGroup.add(lantern)
      this.addTorchLight(side, 2.0, z, 0xff7b22, 2.2, 16)
    })
  }

  /* ----------------------------------------------------
   * 3. The 3D Knight Character (Hero of Life RPG)
   * ---------------------------------------------------- */
  initKnightCharacter() {
    this.knight = new THREE.Group()
    this.knight.position.set(0, -1.2, 3) // Starts facing down the road
    this.scene.add(this.knight)

    // Torso / Steel Breastplate
    const torsoGeo = new THREE.BoxGeometry(0.85, 1.1, 0.55)
    this.knightTorso = new THREE.Mesh(torsoGeo, this.armorSteelMat)
    this.knightTorso.position.y = 1.55
    this.knightTorso.castShadow = true
    this.knight.add(this.knightTorso)

    // Golden Eagle Crest on chest
    const crestGeo = new THREE.BoxGeometry(0.4, 0.35, 0.08)
    const crest = new THREE.Mesh(crestGeo, this.armorGoldMat)
    crest.position.set(0, 1.65, 0.28)
    this.knight.add(crest)

    // Belt and tassets
    const beltGeo = new THREE.BoxGeometry(0.88, 0.16, 0.58)
    const belt = new THREE.Mesh(beltGeo, this.armorGoldMat)
    belt.position.y = 0.98
    this.knight.add(belt)

    // Pauldrons (shoulder plates)
    const pauldronGeo = new THREE.BoxGeometry(0.38, 0.35, 0.45)
    this.pauldronL = new THREE.Mesh(pauldronGeo, this.armorGoldMat)
    this.pauldronL.position.set(-0.58, 2.0, 0)
    this.knight.add(this.pauldronL)

    this.pauldronR = new THREE.Mesh(pauldronGeo, this.armorGoldMat)
    this.pauldronR.position.set(0.58, 2.0, 0)
    this.knight.add(this.pauldronR)

    // Greathelm (Knight Helmet)
    const helmGeo = new THREE.BoxGeometry(0.55, 0.65, 0.6)
    this.knightHead = new THREE.Mesh(helmGeo, this.armorSteelMat)
    this.knightHead.position.y = 2.4
    this.knightHead.castShadow = true
    this.knight.add(this.knightHead)

    // Golden visor slit
    const visorGeo = new THREE.BoxGeometry(0.42, 0.08, 0.08)
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xffb84d })
    const visor = new THREE.Mesh(visorGeo, visorMat)
    visor.position.set(0, 2.42, -0.3)
    this.knight.add(visor)

    // Helmet Crest (golden plume ridge)
    const plumeGeo = new THREE.BoxGeometry(0.08, 0.25, 0.65)
    const plume = new THREE.Mesh(plumeGeo, this.armorGoldMat)
    plume.position.set(0, 2.8, 0)
    this.knight.add(plume)

    // Knight's Cape / Mantle
    const capeGeo = new THREE.PlaneGeometry(0.85, 1.5, 6, 8)
    this.cape = new THREE.Mesh(capeGeo, this.capeMat)
    this.cape.position.set(0, 1.4, 0.32)
    this.knight.add(this.cape)

    // Left Arm & Gauntlet
    const armGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.85, 8)
    this.leftArm = new THREE.Mesh(armGeo, this.armorSteelMat)
    this.leftArm.position.set(-0.55, 1.45, 0)
    this.knight.add(this.leftArm)

    // Right Arm & Gauntlet
    this.rightArm = new THREE.Mesh(armGeo, this.armorSteelMat)
    this.rightArm.position.set(0.55, 1.45, 0)
    this.knight.add(this.rightArm)

    // Broadsword on Knight's back/hip
    const swordGroup = new THREE.Group()
    swordGroup.position.set(-0.45, 1.4, 0.35)
    swordGroup.rotation.z = -Math.PI / 4

    const bladeGeo = new THREE.BoxGeometry(0.08, 1.6, 0.04)
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd8e0ed, metalness: 0.95, roughness: 0.15 })
    const blade = new THREE.Mesh(bladeGeo, bladeMat)
    blade.position.y = -0.4
    swordGroup.add(blade)

    const crossguardGeo = new THREE.BoxGeometry(0.45, 0.08, 0.1)
    const crossguard = new THREE.Mesh(crossguardGeo, this.armorGoldMat)
    crossguard.position.y = 0.4
    swordGroup.add(crossguard)

    const gripGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8)
    const grip = new THREE.Mesh(gripGeo, this.woodMat)
    grip.position.y = 0.6
    swordGroup.add(grip)

    const pommelGeo = new THREE.SphereGeometry(0.07, 8, 8)
    const pommel = new THREE.Mesh(pommelGeo, this.armorGoldMat)
    pommel.position.y = 0.8
    swordGroup.add(pommel)

    this.knight.add(swordGroup)

    // Legs & Greaves
    const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.95, 8)
    this.leftLeg = new THREE.Mesh(legGeo, this.armorSteelMat)
    this.leftLeg.position.set(-0.25, 0.48, 0)
    this.knight.add(this.leftLeg)

    this.rightLeg = new THREE.Mesh(legGeo, this.armorSteelMat)
    this.rightLeg.position.set(0.25, 0.48, 0)
    this.knight.add(this.rightLeg)

    // Knight faces forward down the road (towards -Z)
    this.knight.rotation.y = Math.PI
  }

  /* ----------------------------------------------------
   * 4. Ancient Medieval Quest Board (Z ~ -28)
   * ---------------------------------------------------- */
  initQuestBoard() {
    this.questGroup = new THREE.Group()
    this.questGroup.position.set(3.2, -1.2, -28)
    this.scene.add(this.questGroup)

    // Timber Posts
    const postGeo = new THREE.CylinderGeometry(0.16, 0.2, 4.2, 8)
    const postL = new THREE.Mesh(postGeo, this.woodMat)
    postL.position.set(-1.4, 2.1, 0)
    this.questGroup.add(postL)

    const postR = new THREE.Mesh(postGeo, this.woodMat)
    postR.position.set(1.4, 2.1, 0)
    this.questGroup.add(postR)

    // Crossbeams & Board Planks
    const boardGeo = new THREE.BoxGeometry(3.0, 2.0, 0.18)
    const board = new THREE.Mesh(boardGeo, this.woodMat)
    board.position.set(0, 2.5, 0)
    board.castShadow = true
    this.questGroup.add(board)

    // Roof Shingle Apex
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.6), this.woodMat)
    roofL.position.set(-0.8, 3.7, 0)
    roofL.rotation.z = Math.PI / 7
    this.questGroup.add(roofL)

    const roofR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.6), this.woodMat)
    roofR.position.set(0.8, 3.7, 0)
    roofR.rotation.z = -Math.PI / 7
    this.questGroup.add(roofR)

    // Nailed Parchment Scrolls on Board
    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), this.parchmentMat)
    p1.position.set(-0.7, 2.45, 0.11)
    this.questGroup.add(p1)

    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), this.parchmentMat)
    p2.position.set(0.7, 2.45, 0.11)
    this.questGroup.add(p2)

    // Wax Seals
    const waxMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c })
    const wax1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), waxMat)
    wax1.rotation.x = Math.PI / 2
    wax1.position.set(-0.7, 1.85, 0.13)
    this.questGroup.add(wax1)

    const wax2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), waxMat)
    wax2.rotation.x = Math.PI / 2
    wax2.position.set(0.7, 1.85, 0.13)
    this.questGroup.add(wax2)

    // Hanging Lantern over the Quest Board
    this.addTorchLight(3.2, 1.8, -28, 0xffa033, 2.8, 14)
  }

  /* ----------------------------------------------------
   * 5. The Blacksmith's Forge & XP Progression (Z ~ -65)
   * ---------------------------------------------------- */
  initBlacksmithForge() {
    this.forgeGroup = new THREE.Group()
    this.forgeGroup.position.set(-3.6, -1.2, -65)
    this.scene.add(this.forgeGroup)

    // Stone Furnace Chimney & Hearth
    const furnaceGeo = new THREE.BoxGeometry(2.4, 3.2, 2.0)
    const furnace = new THREE.Mesh(furnaceGeo, this.stoneMat)
    furnace.position.set(0, 1.6, 0)
    this.forgeGroup.add(furnace)

    // Glowing Heart Cavity
    const hearthHoleGeo = new THREE.BoxGeometry(1.2, 0.9, 0.8)
    const hearth = new THREE.Mesh(hearthHoleGeo, this.moltenMat)
    hearth.position.set(0.5, 1.0, 0.7)
    this.forgeGroup.add(hearth)

    // Forge Fire & Dynamic Amber Point Light
    this.forgeLight = this.addTorchLight(-3.1, 0.2, -64.3, 0xff4d00, 3.5, 18)

    // Heavy Blacksmith Anvil on Oak Stump
    const stumpGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.9, 12)
    const stump = new THREE.Mesh(stumpGeo, this.woodMat)
    stump.position.set(1.6, 0.45, 1.2)
    this.forgeGroup.add(stump)

    const anvilGeo = new THREE.BoxGeometry(0.9, 0.45, 0.45)
    const anvil = new THREE.Mesh(anvilGeo, this.armorSteelMat)
    anvil.position.set(1.6, 1.05, 1.2)
    anvil.castShadow = true
    this.forgeGroup.add(anvil)

    // Glowing Sword Blade on Anvil
    const hotBlade = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.12), this.moltenMat)
    hotBlade.position.set(1.6, 1.3, 1.2)
    this.forgeGroup.add(hotBlade)

    // Golden Floating Progression Energy Ring
    const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 12, 48)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 })
    this.forgeRing = new THREE.Mesh(ringGeo, ringMat)
    this.forgeRing.rotation.x = Math.PI / 2
    this.forgeRing.position.set(1.6, 2.4, 1.2)
    this.forgeGroup.add(this.forgeRing)
  }

  /* ----------------------------------------------------
   * 6. Shrine of the Eternal Flame (Streak) (Z ~ -100)
   * ---------------------------------------------------- */
  initEternalFlameShrine() {
    this.shrineGroup = new THREE.Group()
    this.shrineGroup.position.set(3.8, -1.2, -100)
    this.scene.add(this.shrineGroup)

    // Hexagonal Stone Dais Steps
    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.35, 6), this.stoneMat)
    dais1.position.y = 0.18
    this.shrineGroup.add(dais1)

    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.35, 6), this.stoneMat)
    dais2.position.y = 0.52
    this.shrineGroup.add(dais2)

    // Carved Stone Fire Basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.6, 0.9, 12), this.stoneMat)
    basin.position.y = 1.15
    this.shrineGroup.add(basin)

    // The Living Magical Flame Mesh (Layered additive animated cones)
    const flameGeo1 = new THREE.ConeGeometry(0.7, 1.8, 12)
    const flameMat1 = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })
    this.shrineFlame1 = new THREE.Mesh(flameGeo1, flameMat1)
    this.shrineFlame1.position.y = 2.4
    this.shrineGroup.add(this.shrineFlame1)

    const flameGeo2 = new THREE.ConeGeometry(0.45, 1.4, 10)
    const flameMat2 = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    })
    this.shrineFlame2 = new THREE.Mesh(flameGeo2, flameMat2)
    this.shrineFlame2.position.y = 2.5
    this.shrineGroup.add(this.shrineFlame2)

    // Shrine dynamic torchlight
    this.shrineLight = this.addTorchLight(3.8, 1.6, -100, 0xff7b00, 4.0, 22)

    // 3 Floating Streak Rings (3 Days, 7 Days, 30 Days)
    this.streakRings = []
    const radii = [1.5, 2.1, 2.7]
    radii.forEach((r, idx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.035, 8, 36),
        new THREE.MeshBasicMaterial({ color: idx === 2 ? 0xf59e0b : 0xe2e8f0, transparent: true, opacity: 0.6 })
      )
      ring.position.y = 2.2 + idx * 0.4
      ring.rotation.x = Math.PI / 2
      this.shrineGroup.add(ring)
      this.streakRings.push(ring)
    })
  }

  /* ----------------------------------------------------
   * 7. The Attribute Monoliths (Z ~ -135)
   * ---------------------------------------------------- */
  initAttributeMonoliths() {
    this.monolithsGroup = new THREE.Group()
    this.monolithsGroup.position.set(0, -1.2, -135)
    this.scene.add(this.monolithsGroup)

    const obeliskGeo = new THREE.CylinderGeometry(0.35, 0.6, 4.5, 4)

    // 4 Monoliths flanking the road:
    // [-4.5, -3]: STRENGTH (Red/Amber)
    // [-4.5, +3]: INTELLECT (Azure)
    // [+4.5, -3]: DISCIPLINE (Gold)
    // [+4.5, +3]: VITALITY (Emerald)
    const configs = [
      { x: -4.8, z: -3, color: 0xef4444, name: 'Strength' },
      { x: -4.8, z: 3, color: 0x3b82f6, name: 'Intellect' },
      { x: 4.8, z: -3, color: 0xf59e0b, name: 'Discipline' },
      { x: 4.8, z: 3, color: 0x10b981, name: 'Vitality' },
    ]

    this.monolithRunes = []

    configs.forEach((cfg) => {
      const mono = new THREE.Mesh(obeliskGeo, this.stoneMat)
      mono.position.set(cfg.x, 2.25, cfg.z)
      mono.rotation.y = Math.PI / 4
      mono.castShadow = true
      this.monolithsGroup.add(mono)

      // Glowing Runic Sigil Inscription
      const sigilGeo = new THREE.PlaneGeometry(0.4, 0.9)
      const sigilMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.85 })
      const sigil = new THREE.Mesh(sigilGeo, sigilMat)
      sigil.position.set(cfg.x > 0 ? cfg.x - 0.45 : cfg.x + 0.45, 2.5, cfg.z)
      sigil.rotation.y = cfg.x > 0 ? -Math.PI / 2 : Math.PI / 2
      this.monolithsGroup.add(sigil)
      this.monolithRunes.push(sigil)

      // Subtle atmospheric point light
      this.addTorchLight(cfg.x, 2.0, -135 + cfg.z, cfg.color, 1.8, 10)
    })
  }

  /* ----------------------------------------------------
   * 8. The Treasure & Relic Vault (Z ~ -165)
   * ---------------------------------------------------- */
  initTreasureVault() {
    this.treasureGroup = new THREE.Group()
    this.treasureGroup.position.set(-3.5, -1.2, -165)
    this.scene.add(this.treasureGroup)

    // Ornate Oaken Chest
    const chestBaseGeo = new THREE.BoxGeometry(1.6, 0.85, 1.0)
    const chestBase = new THREE.Mesh(chestBaseGeo, this.woodMat)
    chestBase.position.y = 0.45
    chestBase.castShadow = true
    this.treasureGroup.add(chestBase)

    // Curved Chest Lid
    const lidGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12, 1, false, 0, Math.PI)
    lidGeo.rotateZ(Math.PI / 2)
    const lid = new THREE.Mesh(lidGeo, this.woodMat)
    lid.position.set(0, 0.88, 0)
    this.treasureGroup.add(lid)

    // Golden & Iron Straps
    const strapGeo = new THREE.BoxGeometry(0.1, 0.9, 1.04)
    const strap1 = new THREE.Mesh(strapGeo, this.armorGoldMat)
    strap1.position.set(-0.5, 0.5, 0)
    this.treasureGroup.add(strap1)

    const strap2 = new THREE.Mesh(strapGeo, this.armorGoldMat)
    strap2.position.set(0.5, 0.5, 0)
    this.treasureGroup.add(strap2)

    // Glowing Golden Chalices & Coins pile
    const goldPileGeo = new THREE.CylinderGeometry(0.7, 1.1, 0.35, 10)
    const goldPile = new THREE.Mesh(goldPileGeo, this.armorGoldMat)
    goldPile.position.set(1.4, 0.18, 0.3)
    this.treasureGroup.add(goldPile)

    // Warm treasure glow
    this.addTorchLight(-2.5, 1.0, -165, 0xf59e0b, 2.5, 14)
  }

  /* ----------------------------------------------------
   * 9. The Grand Castle Fortress & Animated Gates (Z ~ -205)
   * ---------------------------------------------------- */
  initCastleFortress() {
    this.castleGroup = new THREE.Group()
    this.castleGroup.position.set(0, -1.2, -205)
    this.scene.add(this.castleGroup)

    // 1. Massive Curtain Wall flanking the gate
    const wallGeoL = new THREE.BoxGeometry(24, 16, 4)
    const wallL = new THREE.Mesh(wallGeoL, this.castleStoneMat)
    wallL.position.set(-16, 8, 0)
    wallL.castShadow = true
    this.castleGroup.add(wallL)

    const wallR = new THREE.Mesh(wallGeoL, this.castleStoneMat)
    wallR.position.set(16, 8, 0)
    wallR.castShadow = true
    this.castleGroup.add(wallR)

    // Crenellations (battlements) on walls
    for (let x = -26; x <= 26; x += 2.4) {
      if (Math.abs(x) < 4.5) continue // Leave opening for gatehouse arch
      const battlement = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 4.2), this.castleStoneMat)
      battlement.position.set(x, 16.7, 0)
      this.castleGroup.add(battlement)
    }

    // 2. Twin Gatehouse Cylindrical Bastions / Towers
    const towerGeo = new THREE.CylinderGeometry(3.6, 4.2, 24, 16)
    const roofGeo = new THREE.ConeGeometry(4.6, 9.0, 16)
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x171226, roughness: 0.8 })

    // Left Bastion
    const towerL = new THREE.Mesh(towerGeo, this.castleStoneMat)
    towerL.position.set(-6.5, 12, 0)
    towerL.castShadow = true
    this.castleGroup.add(towerL)

    const roofL = new THREE.Mesh(roofGeo, roofMat)
    roofL.position.set(-6.5, 28.5, 0)
    this.castleGroup.add(roofL)

    // Right Bastion
    const towerR = new THREE.Mesh(towerGeo, this.castleStoneMat)
    towerR.position.set(6.5, 12, 0)
    towerR.castShadow = true
    this.castleGroup.add(towerR)

    const roofR = new THREE.Mesh(roofGeo, roofMat)
    roofR.position.set(6.5, 28.5, 0)
    this.castleGroup.add(roofR)

    // Distant Grand Citadel Keep Tower (rising behind the gate in the clouds)
    const citadelKeep = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 48, 16), this.castleStoneMat)
    citadelKeep.position.set(0, 24, -35)
    this.castleGroup.add(citadelKeep)

    const citadelSpire = new THREE.Mesh(new THREE.ConeGeometry(11, 20, 16), roofMat)
    citadelSpire.position.set(0, 58, -35)
    this.castleGroup.add(citadelSpire)

    // 3. The Grand Arched Gate Portal
    const archTopGeo = new THREE.BoxGeometry(7.0, 3.5, 3.5)
    const archTop = new THREE.Mesh(archTopGeo, this.castleStoneMat)
    archTop.position.set(0, 10.5, 0)
    this.castleGroup.add(archTop)

    // 4. ANIMATED CASTLE GATE DOORS (Left and Right)
    // Left Door Pivot Group
    this.gateDoorLeftPivot = new THREE.Group()
    this.gateDoorLeftPivot.position.set(-2.8, 0, 0)
    this.castleGroup.add(this.gateDoorLeftPivot)

    const doorGeo = new THREE.BoxGeometry(2.8, 9.0, 0.35)
    const doorL = new THREE.Mesh(doorGeo, this.woodMat)
    doorL.position.set(1.4, 4.5, 0) // Shift so pivot is on hinge
    doorL.castShadow = true
    this.gateDoorLeftPivot.add(doorL)

    // Iron Band Studs on Left Door
    const bandL = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.4, 0.4), this.armorSteelMat)
    bandL.position.set(1.4, 4.5, 0)
    this.gateDoorLeftPivot.add(bandL)

    // Right Door Pivot Group
    this.gateDoorRightPivot = new THREE.Group()
    this.gateDoorRightPivot.position.set(2.8, 0, 0)
    this.castleGroup.add(this.gateDoorRightPivot)

    const doorR = new THREE.Mesh(doorGeo, this.woodMat)
    doorR.position.set(-1.4, 4.5, 0) // Shift so pivot is on hinge
    doorR.castShadow = true
    this.gateDoorRightPivot.add(doorR)

    const bandR = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.4, 0.4), this.armorSteelMat)
    bandR.position.set(-1.4, 4.5, 0)
    this.gateDoorRightPivot.add(bandR)

    // 5. Great Iron-Banded Braziers flanking the gate arch
    this.addTorchLight(-3.6, 4.0, -204, 0xff7700, 4.5, 25)
    this.addTorchLight(3.6, 4.0, -204, 0xff7700, 4.5, 25)

    // Deep Inner Courtyard Warm Beacon Light (revealed when gates open)
    this.courtyardLight = new THREE.PointLight(0xffbe44, 0.5, 50, 1.2)
    this.courtyardLight.position.set(0, 5, -215)
    this.castleGroup.add(this.courtyardLight)
  }

  /* ----------------------------------------------------
   * Castle Door Opening Trigger (Called upon Auth Success)
   * ---------------------------------------------------- */
  openCastleGates() {
    this.doorsOpening = true
  }

  /* ----------------------------------------------------
   * Event Handlers
   * ---------------------------------------------------- */
  initEvents() {
    this.handleResize = () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.camera.aspect = this.width / this.height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.width, this.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    }
    window.addEventListener('resize', this.handleResize)

    this.handleVisibility = () => {
      if (document.hidden) {
        this.stop()
      } else {
        this.start()
      }
    }
    document.addEventListener('visibilitychange', this.handleVisibility)
  }

  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress))
  }

  /* ----------------------------------------------------
   * Helper: Circular Glow Texture for Embers & Lights
   * ---------------------------------------------------- */
  createCircleTexture(innerColor, outerColor) {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, innerColor)
    gradient.addColorStop(0.35, outerColor)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  /* ----------------------------------------------------
   * Main Cinematic Render Loop
   * ---------------------------------------------------- */
  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.clock.start()

    const animate = () => {
      if (!this.isRunning) return
      this.animId = requestAnimationFrame(animate)

      const elapsedTime = this.clock.getElapsedTime()

      // Smooth scroll interpolation (exponential damping)
      this.smoothScroll += (this.scrollProgress - this.smoothScroll) * 0.055

      // ------------------------------------------------
      // CINEMATIC CAMERA & CHARACTER SPLINE TRAVEL
      // ------------------------------------------------
      // Progress spans from 0.0 (Void / Opening) to 1.0 (Castle Gates / Realm Entrance)
      const p = this.smoothScroll

      // World Z positions:
      // Void: Z = 14
      // Awakening: Z = 3
      // Quest: Z = -28
      // Forge: Z = -65
      // Flame: Z = -100
      // Monoliths: Z = -135
      // Treasure: Z = -165
      // Castle Gates: Z = -198
      // Courtyard (Door Open): Z = -220

      // Calculate Knight Z: starts at 3, moves along the road down to -195
      const knightTargetZ = 3 - p * 198
      const walkBob = p > 0.05 ? Math.sin(elapsedTime * 8) * 0.06 : 0
      const capeSway = Math.sin(elapsedTime * 4) * 0.12

      if (this.knight) {
        this.knight.position.z = knightTargetZ
        this.knight.position.y = -1.2 + Math.abs(walkBob)

        // Idle breathing vs walking posture
        if (p < 0.08) {
          // Awakening stance: gradual head lift & awakening
          const awaken = Math.min(1, p / 0.08)
          this.knightHead.rotation.x = 0.3 * (1 - awaken)
        } else {
          this.knightHead.rotation.x = 0
        }

        // Leg walking cycle
        if (this.leftLeg && this.rightLeg && p > 0.05 && p < 0.96) {
          this.leftLeg.rotation.x = Math.sin(elapsedTime * 8) * 0.45
          this.rightLeg.rotation.x = -Math.sin(elapsedTime * 8) * 0.45
          this.leftArm.rotation.x = -Math.sin(elapsedTime * 8) * 0.35
          this.rightArm.rotation.x = Math.sin(elapsedTime * 8) * 0.35
        }

        // Cloak undulation with the breeze
        if (this.cape) {
          this.cape.rotation.x = capeSway + (p > 0.05 ? 0.25 : 0.05)
        }
      }

      // Camera Path follows closely behind & slightly above the knight
      // Provides cinematic angles at landmarks
      let camX = Math.sin(p * Math.PI * 4) * 0.8
      let camY = 1.8 + Math.sin(elapsedTime * 0.8) * 0.04
      let camZ = knightTargetZ + 6.5

      // At start (The Void): camera sits back in the cosmos
      if (p < 0.08) {
        camZ = 14 - (p / 0.08) * 4.5
        camY = 2.2
      }

      // Kingdom Reveal & Castle Approach (p > 0.80)
      if (p > 0.8) {
        const castleApproach = (p - 0.8) / 0.2
        camY = 1.8 + castleApproach * 1.6 // Rise up for majestic castle perspective
        camZ = knightTargetZ + 6.0 - castleApproach * 1.5
      }

      // Gate opening traversal
      if (this.doorsOpening) {
        this.doorOpenProgress = Math.min(1, this.doorOpenProgress + 0.015)
        // Swing doors open inward
        if (this.gateDoorLeftPivot) this.gateDoorLeftPivot.rotation.y = -this.doorOpenProgress * 1.7
        if (this.gateDoorRightPivot) this.gateDoorRightPivot.rotation.y = this.doorOpenProgress * 1.7

        // Glow intensify in courtyard
        if (this.courtyardLight) {
          this.courtyardLight.intensity = 0.5 + this.doorOpenProgress * 4.0
        }

        // Camera glides through the doors
        camZ -= this.doorOpenProgress * 12
      }

      this.camera.position.x += (camX - this.camera.position.x) * 0.08
      this.camera.position.y += (camY - this.camera.position.y) * 0.08
      this.camera.position.z += (camZ - this.camera.position.z) * 0.08

      const lookTargetZ = knightTargetZ - 4.5
      this.camera.lookAt(0, 1.4, lookTargetZ)

      // ------------------------------------------------
      // ANIMATE WORLD ELEMENTS
      // ------------------------------------------------
      // 1. Slow cosmic starfield rotation
      if (this.starfield) {
        this.starfield.rotation.y = elapsedTime * 0.003
      }

      // 2. Rising golden embers
      if (this.embers && this.emberPositions) {
        const positions = this.embers.geometry.attributes.position.array
        const count = this.emberVelocities.length

        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          const v = this.emberVelocities[i]
          positions[i3 + 1] += v.y
          positions[i3] += Math.sin(elapsedTime * v.swaySpeed + i) * v.swayAmp
          positions[i3 + 2] += v.z

          if (positions[i3 + 1] > 18) {
            positions[i3 + 1] = -2
            positions[i3] = (Math.random() - 0.5) * 35
            positions[i3 + 2] = this.camera.position.z + (Math.random() - 0.5) * 40
          }
        }
        this.embers.geometry.attributes.position.needsUpdate = true
      }

      // 3. Torch and forge flickering
      this.torchLights.forEach((t, i) => {
        t.light.intensity = t.baseIntensity + Math.sin(elapsedTime * (4.5 + i % 3)) * 0.4
      })

      // 4. Blacksmith Forge Level Up Ring spin
      if (this.forgeRing) {
        this.forgeRing.rotation.z = elapsedTime * 1.5
        this.forgeRing.scale.setScalar(1 + Math.sin(elapsedTime * 3) * 0.08)
      }

      // 5. Shrine Eternal Flame breathing
      if (this.shrineFlame1 && this.shrineFlame2) {
        this.shrineFlame1.scale.y = 1 + Math.sin(elapsedTime * 6) * 0.2
        this.shrineFlame1.rotation.y = elapsedTime * 2
        this.shrineFlame2.scale.y = 1 + Math.cos(elapsedTime * 8) * 0.25
        this.shrineFlame2.rotation.y = -elapsedTime * 3
      }

      // Streak rings rotation
      this.streakRings.forEach((ring, idx) => {
        ring.rotation.z = elapsedTime * (idx % 2 === 0 ? 0.8 : -0.8)
      })

      // 6. Monolith runes gentle pulse
      this.monolithRunes.forEach((rune, idx) => {
        rune.material.opacity = 0.65 + Math.sin(elapsedTime * 2.5 + idx) * 0.25
      })

      this.renderer.render(this.scene, this.camera)
    }

    animate()
  }

  stop() {
    this.isRunning = false
    if (this.animId) {
      cancelAnimationFrame(this.animId)
      this.animId = null
    }
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('visibilitychange', this.handleVisibility)

    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
    }

    if (this.renderer) {
      this.renderer.dispose()
    }
  }
}
