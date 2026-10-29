/**
 * STUDIO MACIEL - 3D BIOMECHANICS & EXERCISE ENGINE
 * Interactive Three.js WebGL simulation with kinetic force vectors,
 * multi-angle 360° inspection, animated lifter, multi-equipment kinematics,
 * and real-time anatomical muscle highlighting.
 * Supports: Deadlift, Squat, Bench Press, Lat Pulldown, and Spinning STS 02.
 */

class StudioMacielBiomechanics3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animFrameId = null;
    this.isVisible = false;

    // Kinematic model pieces
    this.lifterGroup = null;
    this.staticEquipment = null;
    this.dynamicMovingBar = null;
    this.vectorGroup = null;
    this.joints = {};

    // Current State
    this.activeExerciseKey = "deadlift";
    this.currentProgress = 0.0; // 0.0 = Setup, 0.5 = Pull/Drive, 1.0 = Lockout
    this.targetProgress = 0.0;
    this.isAutoPlaying = false;
    this.autoPlayDir = 1;
    this.autoPlaySpeed = 0.007;
    this.showVectors = true;

    // Materials
    this.carbonMat = null;
    this.goldMat = null;
    this.chromeMat = null;
    this.tealMat = null;
    this.activeMuscleMatPrimary = null;
    this.activeMuscleMatSecondary = null;

    // Multi-Exercise Biomechanics Database
    this.exercisesData = {
      deadlift: {
        name: "Levantamento Terra (Deadlift)",
        category: "Cadeia Posterior & Força Bruta",
        equipmentType: "deadlift_bar",
        camTarget: { x: 0, y: 0.75, z: 0 },
        camPos: { x: 3.4, y: 1.8, z: 3.8 },
        phases: {
          0.0: {
            title: "Fase 1: Setup & Saída",
            badge: "Fundação Biomecânica",
            cues: [
              { label: "Barra sobre o meio do pé", desc: "Braço de momento do joelho minimizado para torque ideal." },
              { label: "Dorsais ativadas (Lat Pack)", desc: "Depressão escapular travando a coluna dorsal em posição neutra." },
              { label: "Pressurização do Core", desc: "Manobra de Valsalva estabilizando a lombar sob alta carga." }
            ],
            muscles: ["Isquiotibiais", "Grande Dorsal", "Eretores da Espinha", "Glúteos", "Core"]
          },
          0.5: {
            title: "Fase 2: Tração & Passagem do Joelho",
            badge: "Transferência de Força",
            cues: [
              { label: "Leg Drive Contínuo", desc: "Empurrar o piso com os calcanhares sem elevar o quadril antes do tempo." },
              { label: "Trajetória Perfeitamente Vertical", desc: "A barra sobe em linha reta colada às tíbias." },
              { label: "Tensão de Cadeia Posterior", desc: "Quadríceps e glúteos sincronizados com estabilização torácica." }
            ],
            muscles: ["Quadríceps", "Glúteo Máximo", "Eretores da Espinha", "Antebraços"]
          },
          1.0: {
            title: "Fase 3: Lockout & Bloqueio",
            badge: "Pico de Tensão & Extensão",
            cues: [
              { label: "Extensão Completa do Quadril", desc: "Contração máxima dos glúteos sem hiperextensão lombar." },
              { label: "Caixa Torácica Alta & Ombros", desc: "Ombros neutralizados para trás e para baixo, peitoral firme." },
              { label: "Estabilidade Articular Total", desc: "Joelhos e quadris travados em harmonia na base sólida." }
            ],
            muscles: ["Glúteos", "Trapézio", "Romboides", "Core / Oblíquos"]
          }
        }
      },
      squat: {
        name: "Agachamento Livre (Back Squat)",
        category: "Membros Inferiores & Potência",
        equipmentType: "squat_rack",
        camTarget: { x: 0, y: 0.85, z: 0 },
        camPos: { x: 3.4, y: 1.9, z: 3.6 },
        phases: {
          0.0: {
            title: "Fase 1: Base & Encaixe (Top)",
            badge: "Alinhamento Articular",
            cues: [
              { label: "Apoio no Trapézio Superior", desc: "Barra travada com pegada firme e cotovelos alinhados ao tronco." },
              { label: "Abertura dos Pés", desc: "Pés na largura dos ombros, pontas levemente voltadas para fora (15° a 30°)." },
              { label: "Bracing Abdominal", desc: "Ar comprimido no diafragma para proteger a coluna vertebral." }
            ],
            muscles: ["Quadríceps", "Glúteo Máximo", "Eretores da Espinha", "Core"]
          },
          0.5: {
            title: "Fase 2: Ponto de Inflexão (Paralelo)",
            badge: "Profundidade & Força",
            cues: [
              { label: "Joelhos Alinhados com os Pés", desc: "Evitar valgo dinâmico; abrir espaço para o quadril descer." },
              { label: "Quebra do Paralelo", desc: "Quadril desce ligeiramente abaixo da linha do joelho com controle." },
              { label: "Pé Totalmente Apoiado", desc: "Distribuição homogênea do peso: calcanhar, base do dedão e dedinho." }
            ],
            muscles: ["Quadríceps", "Adutores", "Glúteo Médio & Máximo", "Isquiotibiais"]
          },
          1.0: {
            title: "Fase 3: Subida Explosiva (Lockout)",
            badge: "Extensão Tripla",
            cues: [
              { label: "Empurrar o Piso", desc: "Extensão simultânea de joelhos e quadril sem arredondar o peito." },
              { label: "Bloqueio Superior Neutro", desc: "Retorno à verticalidade sem jogar a pelve excessivamente à frente." }
            ],
            muscles: ["Quadríceps", "Glúteos", "Panturrilhas", "Core"]
          }
        }
      },
      bench_press: {
        name: "Supino Reto com Barra",
        category: "Membros Superiores • Empurrar",
        equipmentType: "bench_press",
        camTarget: { x: 0, y: 0.65, z: 0 },
        camPos: { x: 3.2, y: 2.1, z: 2.8 },
        phases: {
          0.0: {
            title: "Fase 1: Setup & Retração Escapular",
            badge: "Estabilidade Escapular",
            cues: [
              { label: "Ponte e Arco Torácico", desc: "Escápulas retraídas e deprimidas cravadas no banco de couro." },
              { label: "Leg Drive dos Pés", desc: "Pés firmes no chão gerando tensão em cadeia ascendente." }
            ],
            muscles: ["Peitoral Maior", "Deltoide Anterior", "Tríceps", "Latíssimo do Dorso"]
          },
          0.5: {
            title: "Fase 2: Toque Esternal Controlado",
            badge: "Alongamento e Tensão",
            cues: [
              { label: "Cotovelos a 45°- 75°", desc: "Proteção do manguito rotador evitando cotovelos abertos a 90°." },
              { label: "Descida em Arco Suave", desc: "Barra toca suavemente o esterno médio sem rebater no osso." }
            ],
            muscles: ["Peitoral Maior", "Tríceps Braquial", "Deltoide Anterior"]
          },
          1.0: {
            title: "Fase 3: Impulso e Bloqueio Superior",
            badge: "Pico de Contração Peitoral",
            cues: [
              { label: "Empurrar em Direção aos Olhos", desc: "Trajetória angular até a linha vertical dos ombros." },
              { label: "Manter Escápulas Fechadas", desc: "Não perder a retração escapular no ápice do lockout." }
            ],
            muscles: ["Peitoral Maior", "Tríceps Braquial", "Serrátil Anterior"]
          }
        }
      },
      spinning: {
        name: "Spinning Supertech STS 02",
        category: "Cardio & Alta Cadência",
        equipmentType: "spinning_bike",
        camTarget: { x: 0, y: 0.70, z: 0 },
        camPos: { x: 3.2, y: 1.6, z: 3.2 },
        phases: {
          0.0: {
            title: "Fase 1: Posição de Ataque (Aero)",
            badge: "Postura e Alinhamento",
            cues: [
              { label: "Mãos nas Empunhaduras Superiores", desc: "Pegada relaxada sem sobrecarregar punhos ou antebraços." },
              { label: "Tronco em 45°", desc: "Coluna alinhada e abdômen ativo para suporte lombar contínuo." }
            ],
            muscles: ["Quadríceps", "Glúteos", "Isquiotibiais", "Panturrilhas"]
          },
          0.5: {
            title: "Fase 2: Potência na Descida do Pedal",
            badge: "Fase de Propulsão (Downstroke)",
            cues: [
              { label: "Empurrar dos 1 às 5 Horas", desc: "Ativação concêntrica potente de quadríceps e glúteos no arco descendente." },
              { label: "Tornozelo Neutro", desc: "Pé paralelo ao solo sem apontar excessivamente para baixo." }
            ],
            muscles: ["Quadríceps", "Glúteo Máximo", "Panturrilhas"]
          },
          1.0: {
            title: "Fase 3: Transição e Puxada Superior",
            badge: "Cadência e Fluidez (Upstroke)",
            cues: [
              { label: "Puxada Ativa com Firma-Pé", desc: "Isquiotibiais e flexores puxam o pedal suavemente de volta ao topo." },
              { label: "Cadência Constante", desc: "Volante de inércia dourado mantendo ritmo suave sem trancos articulares." }
            ],
            muscles: ["Isquiotibiais", "Tibial Anterior", "Core"]
          }
        }
      },
      lat_pulldown: {
        name: "Puxada Dorsal Alta",
        category: "Dorsais & Largura das Costas",
        equipmentType: "lat_pulldown_machine",
        camTarget: { x: 0, y: 1.1, z: 0 },
        camPos: { x: 3.2, y: 1.8, z: 3.4 },
        phases: {
          0.0: {
            title: "Fase 1: Setup & Alongamento Superior",
            badge: "Pré-Tensão e Amplitude",
            cues: [
              { label: "Pegada Aberta e Pronada", desc: "Mãos firmes na curvatura da barra além da largura dos ombros." },
              { label: "Alongamento das Fibras", desc: "Escápulas sobem naturalmente permitindo que o grande dorsal se alongue." },
              { label: "Fixação das Pernas", desc: "Almofadas de apoio travadas firmemente sobre as coxas." }
            ],
            muscles: ["Grande Dorsal", "Redondo Maior", "Bíceps", "Trapézio Superior"]
          },
          0.5: {
            title: "Fase 2: Tração Esternal & Condução",
            badge: "Pico de Força Concêntrica",
            cues: [
              { label: "Cotovelos para Baixo e para Dentro", desc: "Focar em 'puxar com os cotovelos', e não com os antebraços." },
              { label: "Toque na Clavícula / Alto do Peito", desc: "Barra desce até a altura da fúrcula esternal sem inclinar excessivamente o tronco." },
              { label: "Abertura Torácica", desc: "Peito alto em direção à barra no ponto mais baixo da repetição." }
            ],
            muscles: ["Grande Dorsal", "Trapézio Médio/Inferior", "Romboides", "Bíceps"]
          },
          1.0: {
            title: "Fase 3: Retorno Excêntrico Controlado",
            badge: "Hipertrofia sob Tensão",
            cues: [
              { label: "Subida em 2 a 3 Segundos", desc: "Resistir à subida do cabo mantendo os dorsais ativos." },
              { label: "Tronco Estável", desc: "Sem balanços para frente e para trás durante o curso da repetição." }
            ],
            muscles: ["Grande Dorsal", "Antebraços", "Eretores da Espinha"]
          }
        }
      }
    };

    this.init();
  }

  init() {
    try {
      this.setupMaterials();
      this.setupScene();
      this.setupLighting();
      this.createEnvironment();
      this.createKinematicLifter();
      this.createEquipment(this.exercisesData[this.activeExerciseKey].equipmentType);
      this.createForceVectors();
      this.setupControls();
      this.setupEventListeners();
      this.setupVisibilityObserver();
      this.switchExercise("deadlift");
      this.render();
    } catch (err) {
      console.warn("WebGL initialization note:", err);
      this.renderFallback();
    }
  }

  setupMaterials() {
    this.carbonMat = new THREE.MeshStandardMaterial({
      color: 0x182025,
      roughness: 0.45,
      metalness: 0.65
    });

    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2
    });

    this.chromeMat = new THREE.MeshStandardMaterial({
      color: 0xdde2ea,
      metalness: 0.95,
      roughness: 0.15
    });

    this.darkPlateMat = new THREE.MeshStandardMaterial({
      color: 0x161c20,
      metalness: 0.5,
      roughness: 0.5
    });

    this.tealMat = new THREE.MeshStandardMaterial({
      color: 0x076b77,
      metalness: 0.6,
      roughness: 0.35
    });

    // Glowing Prime Target Muscle (Electric Gold)
    this.activeMuscleMatPrimary = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xd4af37,
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.5
    });

    // Glowing Stabilizer Muscle (Electric Cyan)
    this.activeMuscleMatSecondary = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x076b77,
      emissiveIntensity: 0.7,
      roughness: 0.35,
      metalness: 0.4
    });
  }

  setupScene() {
    const isMobile = window.innerWidth < 640;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || (isMobile ? 380 : 540);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090b, 0.045);

    this.camera = new THREE.PerspectiveCamera(isMobile ? 52 : 45, width / height, 0.1, 100);
    this.camera.position.set(3.4, 1.8, 3.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    const tealRim = new THREE.DirectionalLight(0x00e5ff, 2.2);
    tealRim.position.set(-3, 3, -3);
    this.scene.add(tealRim);

    const goldFill = new THREE.PointLight(0xffd700, 1.0, 8);
    goldFill.position.set(0, 0.6, 2.6);
    this.scene.add(goldFill);
  }

  createEnvironment() {
    // Olympic Hardwood & Rubber Lifting Platform
    const platformGeo = new THREE.BoxGeometry(3.6, 0.08, 2.8);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x12181c,
      roughness: 0.75,
      metalness: 0.25
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.04;
    platform.receiveShadow = true;
    this.scene.add(platform);

    // Dark Center with Gold Trim
    const woodCenterGeo = new THREE.BoxGeometry(1.4, 0.085, 2.78);
    const woodCenterMat = new THREE.MeshStandardMaterial({
      color: 0x182025,
      roughness: 0.55,
      metalness: 0.15
    });
    const woodCenter = new THREE.Mesh(woodCenterGeo, woodCenterMat);
    woodCenter.position.y = -0.035;
    this.scene.add(woodCenter);

    // Studio Maciel Gold / Teal Grid Lines
    const grid = new THREE.GridHelper(6, 12, 0xd4af37, 0x076b77);
    grid.position.y = 0.01;
    this.scene.add(grid);

    // Foot Stance Indicators (Teal/Gold)
    const footMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.45 });
    const footGeo = new THREE.BoxGeometry(0.18, 0.01, 0.38);

    const leftStance = new THREE.Mesh(footGeo, footMat);
    leftStance.position.set(-0.24, 0.01, 0);
    this.scene.add(leftStance);

    const rightStance = new THREE.Mesh(footGeo, footMat);
    rightStance.position.set(0.24, 0.01, 0);
    this.scene.add(rightStance);
  }

  createEquipment(type) {
    // Remove previous equipment groups cleanly
    if (this.staticEquipment) {
      this.scene.remove(this.staticEquipment);
      this.staticEquipment = null;
    }
    if (this.dynamicMovingBar) {
      this.scene.remove(this.dynamicMovingBar);
      this.dynamicMovingBar = null;
    }

    this.staticEquipment = new THREE.Group();
    this.dynamicMovingBar = new THREE.Group();

    if (type === "deadlift_bar") {
      // Olympic Barbell (moves dynamically)
      this.buildOlympicBarbell(this.dynamicMovingBar);
      this.dynamicMovingBar.position.set(0, 0.225, 0);
    } else if (type === "squat_rack") {
      // Squat Rack Uprights (Stationary)
      const rackUprightGeo = new THREE.BoxGeometry(0.08, 2.2, 0.08);
      [-0.75, 0.75].forEach((x) => {
        const upright = new THREE.Mesh(rackUprightGeo, this.darkPlateMat);
        upright.position.set(x, 1.1, -0.15);
        this.staticEquipment.add(upright);

        // Gold J-Hooks
        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.14), this.goldMat);
        hook.position.set(x, 1.35, -0.06);
        this.staticEquipment.add(hook);
      });

      // Top crossbar
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.06), this.goldMat);
      crossbar.position.set(0, 2.15, -0.15);
      this.staticEquipment.add(crossbar);

      // Squat Barbell (moves dynamically)
      this.buildOlympicBarbell(this.dynamicMovingBar);
      this.dynamicMovingBar.position.set(0, 1.35, 0);
    } else if (type === "bench_press") {
      // Fixed Leather Bench
      const benchPad = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 1.35), this.tealMat);
      benchPad.position.set(0, 0.38, 0);
      this.staticEquipment.add(benchPad);

      const benchLegs = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 1.2), this.darkPlateMat);
      benchLegs.position.set(0, 0.19, 0);
      this.staticEquipment.add(benchLegs);

      // Bench Rack Uprights (Stationary)
      [-0.55, 0.55].forEach((x) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.25, 0.07), this.darkPlateMat);
        post.position.set(x, 0.62, 0.15);
        this.staticEquipment.add(post);

        const jHook = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.12), this.goldMat);
        jHook.position.set(x, 1.15, 0.15);
        this.staticEquipment.add(jHook);
      });

      // Bench Barbell (moves strictly vertically)
      this.buildOlympicBarbell(this.dynamicMovingBar);
      this.dynamicMovingBar.position.set(0, 1.15, 0.15);
    } else if (type === "spinning_bike") {
      // Supertech STS 02 Spinning Bike (Stationary Frame)
      const baseFeet = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 1.3), this.darkPlateMat);
      baseFeet.position.set(0, 0.03, 0);
      this.staticEquipment.add(baseFeet);

      const frameBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.85), this.tealMat);
      frameBeam.rotation.x = -0.35;
      frameBeam.position.set(0, 0.45, 0.05);
      this.staticEquipment.add(frameBeam);

      const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), this.chromeMat);
      seatPost.position.set(0, 0.68, -0.22);
      this.staticEquipment.add(seatPost);

      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.32), this.darkPlateMat);
      saddle.position.set(0, 0.85, -0.22);
      this.staticEquipment.add(saddle);

      const handlePost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 12), this.chromeMat);
      handlePost.position.set(0, 0.78, 0.35);
      this.staticEquipment.add(handlePost);

      const handlebars = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.22), this.goldMat);
      handlebars.position.set(0, 0.98, 0.35);
      this.staticEquipment.add(handlebars);

      // Gold Inertia Flywheel (Dynamic rotating mesh)
      const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32), this.goldMat);
      flywheel.rotation.z = Math.PI / 2;
      flywheel.position.set(0, 0.38, 0.42);
      this.dynamicMovingBar.add(flywheel);
      this.joints.bikeWheel = flywheel;

      // Crank arms & pedals
      const crankL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.04), this.chromeMat);
      crankL.position.set(-0.16, 0.38, 0.05);
      this.dynamicMovingBar.add(crankL);
      this.joints.crankL = crankL;

      const crankR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.04), this.chromeMat);
      crankR.position.set(0.16, 0.38, 0.05);
      this.dynamicMovingBar.add(crankR);
      this.joints.crankR = crankR;
    } else if (type === "lat_pulldown_machine") {
      // Lat Pulldown Machine Tower (Stationary)
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.3, 0.55), this.darkPlateMat);
      tower.position.set(0, 1.15, -0.65);
      this.staticEquipment.add(tower);

      const topBoom = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.1), this.tealMat);
      topBoom.position.set(0, 2.25, -0.15);
      this.staticEquipment.add(topBoom);

      const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), this.goldMat);
      pulley.rotation.z = Math.PI / 2;
      pulley.position.set(0, 2.22, 0.08);
      this.staticEquipment.add(pulley);

      const seatPad = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.55), this.tealMat);
      seatPad.position.set(0, 0.45, -0.1);
      this.staticEquipment.add(seatPad);

      const thighRollers = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.65, 16), this.darkPlateMat);
      thighRollers.rotation.z = Math.PI / 2;
      thighRollers.position.set(0, 0.58, 0.15);
      this.staticEquipment.add(thighRollers);

      // Lat Pulldown Wide Curved Bar (Dynamic)
      const latBar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.55, 20), this.goldMat);
      latBar.rotation.z = Math.PI / 2;
      this.dynamicMovingBar.add(latBar);

      // Center cable connector
      const connector = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), this.chromeMat);
      this.dynamicMovingBar.add(connector);

      this.dynamicMovingBar.position.set(0, 1.95, 0.08);
    }

    this.scene.add(this.staticEquipment);
    this.scene.add(this.dynamicMovingBar);
  }

  buildOlympicBarbell(group) {
    // Steel Shaft (220cm Olympic Bar)
    const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 24);
    const bar = new THREE.Mesh(barGeo, this.chromeMat);
    bar.rotation.z = Math.PI / 2;
    bar.castShadow = true;
    group.add(bar);

    // Knurling center
    const knurlGeo = new THREE.CylinderGeometry(0.0152, 0.0152, 0.16, 16);
    const centerKnurl = new THREE.Mesh(knurlGeo, this.goldMat);
    centerKnurl.rotation.z = Math.PI / 2;
    group.add(centerKnurl);

    // Olympic Bumper Plates (Studio Maciel Gold + Dark Carbon)
    const plateGeo = new THREE.CylinderGeometry(0.225, 0.225, 0.05, 32);
    [-0.72, 0.72].forEach((x) => {
      const plate1 = new THREE.Mesh(plateGeo, this.goldMat);
      plate1.rotation.z = Math.PI / 2;
      plate1.position.x = x;
      plate1.castShadow = true;
      group.add(plate1);
    });

    [-0.78, 0.78].forEach((x) => {
      const plate2 = new THREE.Mesh(plateGeo, this.darkPlateMat);
      plate2.rotation.z = Math.PI / 2;
      plate2.position.x = x;
      plate2.castShadow = true;
      group.add(plate2);
    });

    // Olympic Collars
    const collarGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.035, 16);
    [-0.83, 0.83].forEach((x) => {
      const collar = new THREE.Mesh(collarGeo, this.chromeMat);
      collar.rotation.z = Math.PI / 2;
      collar.position.x = x;
      group.add(collar);
    });
  }

  createKinematicLifter() {
    this.lifterGroup = new THREE.Group();

    // 1. Pelvis / Hips (Root of body kinematics)
    const pelvisGeo = new THREE.BoxGeometry(0.32, 0.16, 0.22);
    const pelvis = new THREE.Mesh(pelvisGeo, this.activeMuscleMatPrimary);
    pelvis.castShadow = true;
    this.joints.pelvis = pelvis;
    this.lifterGroup.add(pelvis);

    // 2. Spine / Torso
    this.joints.torsoPivot = new THREE.Group();
    pelvis.add(this.joints.torsoPivot);

    const torsoGeo = new THREE.BoxGeometry(0.36, 0.48, 0.24);
    const torso = new THREE.Mesh(torsoGeo, this.carbonMat);
    torso.position.y = 0.32;
    torso.castShadow = true;
    this.joints.torsoPivot.add(torso);
    this.joints.torso = torso;

    // Latissimus Dorsi / Back
    const latsGeo = new THREE.BoxGeometry(0.38, 0.35, 0.08);
    const lats = new THREE.Mesh(latsGeo, this.activeMuscleMatSecondary);
    lats.position.set(0, 0.32, -0.1);
    this.joints.torsoPivot.add(lats);
    this.joints.lats = lats;

    // Pectorals / Chest
    const chestGeo = new THREE.BoxGeometry(0.36, 0.22, 0.08);
    const chest = new THREE.Mesh(chestGeo, this.activeMuscleMatPrimary);
    chest.position.set(0, 0.42, 0.1);
    this.joints.torsoPivot.add(chest);
    this.joints.chest = chest;

    // 3. Head & Neck
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.12, 12);
    const neck = new THREE.Mesh(neckGeo, this.carbonMat);
    neck.position.y = 0.62;
    this.joints.torsoPivot.add(neck);

    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const head = new THREE.Mesh(headGeo, this.carbonMat);
    head.position.y = 0.74;
    this.joints.torsoPivot.add(head);

    // 4. Arms
    this.joints.leftShoulder = new THREE.Group();
    this.joints.leftShoulder.position.set(-0.26, 0.5, 0);
    this.joints.torsoPivot.add(this.joints.leftShoulder);

    const armGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.68, 12);
    const leftArm = new THREE.Mesh(armGeo, this.activeMuscleMatSecondary);
    leftArm.position.y = -0.34;
    leftArm.castShadow = true;
    this.joints.leftShoulder.add(leftArm);
    this.joints.leftArm = leftArm;

    this.joints.rightShoulder = new THREE.Group();
    this.joints.rightShoulder.position.set(0.26, 0.5, 0);
    this.joints.torsoPivot.add(this.joints.rightShoulder);

    const rightArm = new THREE.Mesh(armGeo, this.activeMuscleMatSecondary);
    rightArm.position.y = -0.34;
    rightArm.castShadow = true;
    this.joints.rightShoulder.add(rightArm);
    this.joints.rightArm = rightArm;

    // 5. Legs
    const footGeo = new THREE.BoxGeometry(0.12, 0.08, 0.26);
    this.joints.leftFoot = new THREE.Mesh(footGeo, this.carbonMat);
    this.joints.leftFoot.position.set(-0.24, 0.04, 0);
    this.lifterGroup.add(this.joints.leftFoot);

    this.joints.rightFoot = new THREE.Mesh(footGeo, this.carbonMat);
    this.joints.rightFoot.position.set(0.24, 0.04, 0);
    this.lifterGroup.add(this.joints.rightFoot);

    const thighGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.44, 12);
    this.joints.leftThigh = new THREE.Mesh(thighGeo, this.activeMuscleMatPrimary);
    this.joints.rightThigh = new THREE.Mesh(thighGeo, this.activeMuscleMatPrimary);
    this.lifterGroup.add(this.joints.leftThigh);
    this.lifterGroup.add(this.joints.rightThigh);

    const shinGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.42, 12);
    this.joints.leftShin = new THREE.Mesh(shinGeo, this.carbonMat);
    this.joints.rightShin = new THREE.Mesh(shinGeo, this.carbonMat);
    this.lifterGroup.add(this.joints.leftShin);
    this.lifterGroup.add(this.joints.rightShin);

    const kneeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    this.joints.leftKnee = new THREE.Mesh(kneeGeo, this.carbonMat);
    this.joints.rightKnee = new THREE.Mesh(kneeGeo, this.carbonMat);
    this.lifterGroup.add(this.joints.leftKnee);
    this.joints.rightKnee = new THREE.Mesh(kneeGeo, this.carbonMat);

    this.scene.add(this.lifterGroup);
  }

  createForceVectors() {
    this.vectorGroup = new THREE.Group();

    // Vertical Ground Reaction Force Vectors (Left & Right Foot)
    const arrowDir = new THREE.Vector3(0, 1, 0);
    const arrowOriginL = new THREE.Vector3(-0.24, 0.08, 0);
    const arrowOriginR = new THREE.Vector3(0.24, 0.08, 0);

    this.arrowL = new THREE.ArrowHelper(arrowDir, arrowOriginL, 0.55, 0xffd700, 0.12, 0.06);
    this.arrowR = new THREE.ArrowHelper(arrowDir, arrowOriginR, 0.55, 0xffd700, 0.12, 0.06);
    this.vectorGroup.add(this.arrowL);
    this.vectorGroup.add(this.arrowR);

    // Laser Guideline
    const laserMat = new THREE.LineDashedMaterial({
      color: 0x00e5ff,
      dashSize: 0.05,
      gapSize: 0.03,
      linewidth: 2
    });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 2.2, 0)
    ]);
    this.laserLine = new THREE.Line(laserGeo, laserMat);
    this.laserLine.computeLineDistances();
    this.vectorGroup.add(this.laserLine);

    this.scene.add(this.vectorGroup);
  }

  setupControls() {
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 2.0;
      this.controls.maxDistance = 7.0;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
      this.controls.target.set(0, 0.75, 0);
      this.controls.enableZoom = false; // Prevent trapping vertical scroll on mobile
      this.controls.update();
    }
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize());

    // Exercise Pill Switchers
    const exBtns = document.querySelectorAll("[data-exercise-switch]");
    exBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-exercise-switch");
        if (key && this.exercisesData[key]) {
          this.switchExercise(key);
          exBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        }
      });
    });

    // Phase Switcher Buttons
    const phaseBtns = document.querySelectorAll("[data-phase-btn]");
    phaseBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const phaseVal = parseFloat(btn.getAttribute("data-phase-btn"));
        this.setPhase(phaseVal);
        phaseBtns.forEach((b) => b.classList.remove("active-phase"));
        btn.classList.add("active-phase");
      });
    });

    // Scrubber Range Input
    const scrubber = document.getElementById("deadlift-scrubber");
    if (scrubber) {
      scrubber.addEventListener("input", (e) => {
        this.isAutoPlaying = false;
        this.updatePlayBtnState();
        this.setPhase(parseFloat(e.target.value));
      });
    }

    // Auto-Play Demonstration Button
    const playBtn = document.getElementById("deadlift-play-toggle");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        this.isAutoPlaying = !this.isAutoPlaying;
        this.updatePlayBtnState();
      });
    }

    // Toggle Force Vectors
    const vectorToggle = document.getElementById("deadlift-vector-toggle");
    if (vectorToggle) {
      vectorToggle.addEventListener("click", () => {
        this.showVectors = !this.showVectors;
        this.vectorGroup.visible = this.showVectors;
        vectorToggle.classList.toggle("bg-teal-maciel", this.showVectors);
        vectorToggle.classList.toggle("text-white", this.showVectors);
      });
    }

    // Camera Preset Buttons
    const camPresets = document.querySelectorAll("[data-cam-preset]");
    camPresets.forEach((presetBtn) => {
      presetBtn.addEventListener("click", () => {
        const mode = presetBtn.getAttribute("data-cam-preset");
        this.setCameraPreset(mode);
        camPresets.forEach((p) => p.classList.remove("active-cam"));
        presetBtn.classList.add("active-cam");
      });
    });
  }

  switchExercise(exerciseKey) {
    if (!this.exercisesData[exerciseKey]) return;
    this.activeExerciseKey = exerciseKey;
    const ex = this.exercisesData[exerciseKey];

    // Rebuild equipment
    this.createEquipment(ex.equipmentType);

    // Update muscle highlighting colors according to active exercise target
    if (exerciseKey === "deadlift") {
      this.joints.pelvis.material = this.activeMuscleMatPrimary;
      this.joints.lats.material = this.activeMuscleMatPrimary;
      this.joints.chest.material = this.activeMuscleMatSecondary;
      this.joints.leftThigh.material = this.activeMuscleMatSecondary;
      this.joints.rightThigh.material = this.activeMuscleMatSecondary;
    } else if (exerciseKey === "squat") {
      this.joints.pelvis.material = this.activeMuscleMatPrimary;
      this.joints.lats.material = this.carbonMat;
      this.joints.chest.material = this.carbonMat;
      this.joints.leftThigh.material = this.activeMuscleMatPrimary;
      this.joints.rightThigh.material = this.activeMuscleMatPrimary;
    } else if (exerciseKey === "bench_press") {
      this.joints.pelvis.material = this.carbonMat;
      this.joints.lats.material = this.carbonMat;
      this.joints.chest.material = this.activeMuscleMatPrimary;
      this.joints.leftArm.material = this.activeMuscleMatPrimary;
      this.joints.rightArm.material = this.activeMuscleMatPrimary;
      this.joints.leftThigh.material = this.carbonMat;
      this.joints.rightThigh.material = this.carbonMat;
    } else if (exerciseKey === "spinning") {
      this.joints.pelvis.material = this.activeMuscleMatSecondary;
      this.joints.lats.material = this.carbonMat;
      this.joints.chest.material = this.carbonMat;
      this.joints.leftThigh.material = this.activeMuscleMatPrimary;
      this.joints.rightThigh.material = this.activeMuscleMatPrimary;
      this.joints.leftShin.material = this.activeMuscleMatPrimary;
      this.joints.rightShin.material = this.activeMuscleMatPrimary;
    } else if (exerciseKey === "lat_pulldown") {
      this.joints.pelvis.material = this.carbonMat;
      this.joints.lats.material = this.activeMuscleMatPrimary;
      this.joints.chest.material = this.carbonMat;
      this.joints.leftArm.material = this.activeMuscleMatSecondary;
      this.joints.rightArm.material = this.activeMuscleMatSecondary;
      this.joints.leftThigh.material = this.carbonMat;
      this.joints.rightThigh.material = this.carbonMat;
    }

    // Reset progress to 0 and render
    this.currentProgress = 0.0;
    this.targetProgress = 0.0;
    this.setPhase(0.0);
    this.updateKinematics(0.0);

    // Update Camera Target
    if (this.controls && ex.camTarget) {
      if (typeof gsap !== 'undefined') {
        gsap.to(this.controls.target, {
          x: ex.camTarget.x,
          y: ex.camTarget.y,
          z: ex.camTarget.z,
          duration: 0.9,
          ease: "power2.out",
          onUpdate: () => this.controls.update()
        });
      } else {
        this.controls.target.set(ex.camTarget.x, ex.camTarget.y, ex.camTarget.z);
        this.controls.update();
      }
    }
  }

  setCameraPreset(mode) {
    if (!this.controls) return;

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(this.camera.position);
      gsap.killTweensOf(this.controls.target);
    }

    const ex = this.exercisesData[this.activeExerciseKey] || {};
    const lookTarget = ex.camTarget || { x: 0, y: 0.75, z: 0 };
    let targetPos = { x: 3.4, y: 1.8, z: 3.8 };

    if (mode === "sagittal") {
      targetPos = { x: 4.8, y: 0.85, z: 0.05 };
    } else if (mode === "front") {
      targetPos = { x: 0.05, y: 1.0, z: 4.6 };
    } else if (mode === "perspective") {
      targetPos = { x: 3.2, y: 1.7, z: 3.5 };
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => this.controls.update()
      });

      gsap.to(this.controls.target, {
        x: lookTarget.x,
        y: lookTarget.y,
        z: lookTarget.z,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => this.controls.update()
      });
    } else {
      this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
      this.controls.target.set(lookTarget.x, lookTarget.y, lookTarget.z);
      this.controls.update();
    }
  }

  updatePlayBtnState() {
    const playBtn = document.getElementById("deadlift-play-toggle");
    if (!playBtn) return;
    if (this.isAutoPlaying) {
      playBtn.innerHTML = `<svg class="w-4 h-4 text-gold-maciel" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Pausar</span>`;
      playBtn.classList.add("border-gold-500", "text-gold-300");
    } else {
      playBtn.innerHTML = `<svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Execução Contínua</span>`;
      playBtn.classList.remove("border-gold-500", "text-gold-300");
    }
  }

  setPhase(val) {
    this.targetProgress = Math.max(0, Math.min(1, val));

    const scrubber = document.getElementById("deadlift-scrubber");
    if (scrubber && Math.abs(parseFloat(scrubber.value) - val) > 0.01) {
      scrubber.value = val;
    }

    let key = 0.0;
    if (val > 0.75) key = 1.0;
    else if (val > 0.25) key = 0.5;

    this.updateFloatingCard(key);
  }

  updateFloatingCard(phaseKey) {
    const currentEx = this.exercisesData[this.activeExerciseKey];
    if (!currentEx) return;
    const data = currentEx.phases[phaseKey];
    if (!data) return;

    const titleEl = document.getElementById("3d-card-title");
    const badgeEl = document.getElementById("3d-card-badge");
    const cuesContainer = document.getElementById("3d-card-cues");
    const musclesContainer = document.getElementById("3d-card-muscles");

    if (titleEl) titleEl.innerText = data.title;
    if (badgeEl) badgeEl.innerText = data.badge;

    if (cuesContainer) {
      cuesContainer.innerHTML = data.cues
        .map(
          (c) => `
        <div class="flex items-start gap-2 text-xs text-gray-300">
          <span class="w-1.5 h-1.5 rounded-full bg-gold-maciel mt-1.5 shrink-0"></span>
          <div>
            <strong class="text-white block font-semibold">${c.label}</strong>
            <span class="text-gray-400">${c.desc}</span>
          </div>
        </div>
      `
        )
        .join("");
    }

    if (musclesContainer) {
      musclesContainer.innerHTML = data.muscles
        .map(
          (m, idx) => `
        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
          idx === 0
            ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-[0_0_8px_rgba(255,215,0,0.3)]"
            : "bg-teal-950/80 border border-teal-500/40 text-teal-300"
        }">${m}</span>
      `
        )
        .join("");
    }
  }

  updateKinematics(p) {
    const exKey = this.activeExerciseKey;

    if (exKey === "deadlift") {
      // 1. DEADLIFT KINEMATICS
      // Reset feet to default lifting stance
      this.joints.leftFoot.position.set(-0.24, 0.04, 0);
      this.joints.rightFoot.position.set(0.24, 0.04, 0);

      const barY = 0.225 + (0.88 - 0.225) * p;
      if (this.dynamicMovingBar) this.dynamicMovingBar.position.set(0, barY, 0);

      const pelvisY = 0.52 + (0.94 - 0.52) * p;
      const pelvisZ = -0.32 * (1 - p);
      this.joints.pelvis.position.set(0, pelvisY, pelvisZ);

      const torsoRotX = 0.78 * (1 - p);
      this.joints.torsoPivot.rotation.x = torsoRotX;

      const armAngle = -torsoRotX * 0.95;
      this.joints.leftShoulder.rotation.x = armAngle;
      this.joints.rightShoulder.rotation.x = armAngle;

      const kneeY = 0.4 + (0.48 - 0.4) * p;
      const kneeZ = 0.08 * (1 - p);
      this.joints.leftKnee.position.set(-0.24, kneeY, kneeZ);
      this.joints.rightKnee.position.set(0.24, kneeY, kneeZ);

      this.orientSegment(this.joints.leftThigh, new THREE.Vector3(-0.24, pelvisY, pelvisZ), this.joints.leftKnee.position);
      this.orientSegment(this.joints.rightThigh, new THREE.Vector3(0.24, pelvisY, pelvisZ), this.joints.rightKnee.position);
      this.orientSegment(this.joints.leftShin, this.joints.leftKnee.position, new THREE.Vector3(-0.24, 0.08, 0));
      this.orientSegment(this.joints.rightShin, this.joints.rightKnee.position, new THREE.Vector3(0.24, 0.08, 0));

      if (this.laserLine) this.laserLine.position.set(0, 0, 0);

    } else if (exKey === "squat") {
      // 2. BACK SQUAT KINEMATICS
      this.joints.leftFoot.position.set(-0.24, 0.04, 0);
      this.joints.rightFoot.position.set(0.24, 0.04, 0);

      // Depth follows smooth sine curve (0 = top, 1 = bottom parallel, 0 = lockout)
      const depth = Math.sin(p * Math.PI);

      const barY = 1.35 - 0.47 * depth;
      if (this.dynamicMovingBar) this.dynamicMovingBar.position.set(0, barY, -0.05);

      const pelvisY = 0.94 - 0.42 * depth;
      const pelvisZ = -0.30 * depth;
      this.joints.pelvis.position.set(0, pelvisY, pelvisZ);

      const torsoRotX = 0.38 * depth;
      this.joints.torsoPivot.rotation.x = torsoRotX;

      // Arms locked holding the bar behind upper traps
      this.joints.leftShoulder.rotation.x = -0.65;
      this.joints.rightShoulder.rotation.x = -0.65;

      const kneeY = 0.48 - 0.08 * depth;
      const kneeZ = 0.22 * depth;
      this.joints.leftKnee.position.set(-0.24, kneeY, kneeZ);
      this.joints.rightKnee.position.set(0.24, kneeY, kneeZ);

      this.orientSegment(this.joints.leftThigh, new THREE.Vector3(-0.24, pelvisY, pelvisZ), this.joints.leftKnee.position);
      this.orientSegment(this.joints.rightThigh, new THREE.Vector3(0.24, pelvisY, pelvisZ), this.joints.rightKnee.position);
      this.orientSegment(this.joints.leftShin, this.joints.leftKnee.position, new THREE.Vector3(-0.24, 0.08, 0));
      this.orientSegment(this.joints.rightShin, this.joints.rightKnee.position, new THREE.Vector3(0.24, 0.08, 0));

      if (this.laserLine) this.laserLine.position.set(0, 0, -0.05);

    } else if (exKey === "bench_press") {
      // 3. BENCH PRESS KINEMATICS
      // Lifter lies supine on the flat bench
      this.joints.leftFoot.position.set(-0.36, 0.04, -0.55);
      this.joints.rightFoot.position.set(0.36, 0.04, -0.55);

      const pelvisY = 0.44;
      const pelvisZ = -0.35;
      this.joints.pelvis.position.set(0, pelvisY, pelvisZ);
      this.joints.torsoPivot.rotation.x = -Math.PI / 2; // Flat on back

      // Press depth follows smooth sine curve (unrack -> chest touch -> lockout)
      const pressDepth = Math.sin(p * Math.PI);
      const barY = 1.15 - 0.53 * pressDepth;
      if (this.dynamicMovingBar) this.dynamicMovingBar.position.set(0, barY, 0.15);

      // Arms move pressing upward
      const armAngle = -0.15 - 0.85 * (1 - pressDepth);
      this.joints.leftShoulder.rotation.x = armAngle;
      this.joints.rightShoulder.rotation.x = armAngle;

      // Knees bent with feet planted firmly beside bench
      const kneeY = 0.44;
      const kneeZ = -0.25;
      this.joints.leftKnee.position.set(-0.36, kneeY, kneeZ);
      this.joints.rightKnee.position.set(0.36, kneeY, kneeZ);

      this.orientSegment(this.joints.leftThigh, new THREE.Vector3(-0.16, pelvisY, pelvisZ), this.joints.leftKnee.position);
      this.orientSegment(this.joints.rightThigh, new THREE.Vector3(0.16, pelvisY, pelvisZ), this.joints.rightKnee.position);
      this.orientSegment(this.joints.leftShin, this.joints.leftKnee.position, new THREE.Vector3(-0.36, 0.08, -0.55));
      this.orientSegment(this.joints.rightShin, this.joints.rightKnee.position, new THREE.Vector3(0.36, 0.08, -0.55));

      if (this.laserLine) this.laserLine.position.set(0, 0, 0.15);

    } else if (exKey === "spinning") {
      // 4. SPINNING SUPERTECH STS 02 KINEMATICS
      this.joints.pelvis.position.set(0, 0.85, -0.22);
      this.joints.torsoPivot.rotation.x = 0.52; // Aero sprint forward lean

      // Hands on handlebars
      this.joints.leftShoulder.rotation.x = -0.55;
      this.joints.rightShoulder.rotation.x = -0.55;

      // Pedaling circle (radius = 0.18m around crank center 0.40, 0.05)
      const angle = p * Math.PI * 4; // 2 revolutions per scrub cycle
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      const footLY = 0.40 + 0.18 * sinA;
      const footLZ = 0.05 + 0.18 * cosA;
      const footRY = 0.40 - 0.18 * sinA;
      const footRZ = 0.05 - 0.18 * cosA;

      this.joints.leftFoot.position.set(-0.22, footLY, footLZ);
      this.joints.rightFoot.position.set(0.22, footRY, footRZ);

      // Knees flex and extend continuously
      const kneeLY = 0.62 + 0.12 * sinA;
      const kneeLZ = -0.05 + 0.12 * cosA;
      const kneeRY = 0.62 - 0.12 * sinA;
      const kneeRZ = -0.05 - 0.12 * cosA;

      this.joints.leftKnee.position.set(-0.22, kneeLY, kneeLZ);
      this.joints.rightKnee.position.set(0.22, kneeRY, kneeRZ);

      this.orientSegment(this.joints.leftThigh, new THREE.Vector3(-0.16, 0.85, -0.22), this.joints.leftKnee.position);
      this.orientSegment(this.joints.rightThigh, new THREE.Vector3(0.16, 0.85, -0.22), this.joints.rightKnee.position);
      this.orientSegment(this.joints.leftShin, this.joints.leftKnee.position, new THREE.Vector3(-0.22, footLY, footLZ));
      this.orientSegment(this.joints.rightShin, this.joints.rightKnee.position, new THREE.Vector3(0.22, footRY, footRZ));

      // Rotate bike flywheel & crank arms
      if (this.joints.bikeWheel) {
        this.joints.bikeWheel.rotation.x = angle * 2.5;
      }
      if (this.joints.crankL && this.joints.crankR) {
        this.joints.crankL.rotation.x = angle;
        this.joints.crankR.rotation.x = angle + Math.PI;
      }

    } else if (exKey === "lat_pulldown") {
      // 5. LAT PULLDOWN KINEMATICS
      // Seated on machine facing tower
      this.joints.leftFoot.position.set(-0.24, 0.04, 0.25);
      this.joints.rightFoot.position.set(0.24, 0.04, 0.25);

      const pelvisY = 0.50;
      const pelvisZ = -0.10;
      this.joints.pelvis.position.set(0, pelvisY, pelvisZ);
      this.joints.torsoPivot.rotation.x = -0.22; // 15° slight thoracic arch

      // Thighs locked under knee pads
      this.joints.leftKnee.position.set(-0.24, 0.54, 0.15);
      this.joints.rightKnee.position.set(0.24, 0.54, 0.15);

      this.orientSegment(this.joints.leftThigh, new THREE.Vector3(-0.16, pelvisY, pelvisZ), this.joints.leftKnee.position);
      this.orientSegment(this.joints.rightThigh, new THREE.Vector3(0.16, pelvisY, pelvisZ), this.joints.rightKnee.position);
      this.orientSegment(this.joints.leftShin, this.joints.leftKnee.position, new THREE.Vector3(-0.24, 0.08, 0.25));
      this.orientSegment(this.joints.rightShin, this.joints.rightKnee.position, new THREE.Vector3(0.24, 0.08, 0.25));

      // Bar pulls from overhead stretch (1.95m) down to clavicle (1.25m)
      const pullDepth = Math.sin(p * Math.PI);
      const barY = 1.95 - 0.70 * pullDepth;
      if (this.dynamicMovingBar) this.dynamicMovingBar.position.set(0, barY, 0.08);

      // Shoulders angle down and elbows drive back
      const shoulderAngle = -2.15 + 1.35 * pullDepth;
      this.joints.leftShoulder.rotation.x = shoulderAngle;
      this.joints.rightShoulder.rotation.x = shoulderAngle;

      if (this.laserLine) this.laserLine.position.set(0, 0, 0.08);
    }

    // Dynamic Muscle Glowing Intensities
    if (this.activeMuscleMatPrimary) {
      const intensity = 0.7 + Math.sin(p * Math.PI) * 0.9;
      this.activeMuscleMatPrimary.emissiveIntensity = intensity;
    }

    // Dynamic Ground Reaction Force Vectors
    if (this.arrowL && this.arrowR) {
      const forceScale = 0.45 + (1 - p * 0.5) * 0.35;
      this.arrowL.setLength(forceScale, 0.12, 0.06);
      this.arrowR.setLength(forceScale, 0.12, 0.06);
    }
  }

  orientSegment(mesh, pointA, pointB) {
    if (!mesh) return;
    const dir = new THREE.Vector3().subVectors(pointB, pointA);
    const len = dir.length();
    mesh.position.copy(pointA).addScaledVector(dir, 0.5);
    mesh.scale.set(1, Math.max(0.1, len / 0.44), 1);

    const up = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  }

  setupVisibilityObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !this.animFrameId) {
            this.render();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.container);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const isMobile = window.innerWidth < 640;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 540;

    this.camera.aspect = width / height;
    this.camera.fov = isMobile ? 52 : 45;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    if (this.controls) {
      this.controls.update();
    }
  }

  render() {
    if (!this.isVisible && this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
      return;
    }

    this.animFrameId = requestAnimationFrame(() => this.render());

    // Auto-play oscillation
    if (this.isAutoPlaying) {
      this.targetProgress += this.autoPlaySpeed * this.autoPlayDir;
      if (this.targetProgress >= 1.0) {
        this.targetProgress = 1.0;
        this.autoPlayDir = -1;
      } else if (this.targetProgress <= 0.0) {
        this.targetProgress = 0.0;
        this.autoPlayDir = 1;
      }
      this.setPhase(this.targetProgress);
    }

    // Smooth Lerp towards targetProgress
    const delta = (this.targetProgress - this.currentProgress) * 0.12;
    if (Math.abs(delta) > 0.0005) {
      this.currentProgress += delta;
      this.updateKinematics(this.currentProgress);
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  renderFallback() {
    this.container.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-carbon-950/90 rounded-2xl border border-teal-maciel/40">
        <div class="w-16 h-16 rounded-full bg-teal-maciel/20 border border-teal-glow flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-teal-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h4 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">Módulo Biomecânico 3D Studio Maciel</h4>
        <p class="text-sm text-gray-400 max-w-md mb-4">Análise cinética dos 3 momentos de execução biomecânica com ativação muscular precisa.</p>
        <div class="flex gap-2">
          <span class="px-3 py-1 bg-teal-950/80 border border-teal-glow/40 rounded-full text-xs text-teal-300 font-semibold">Fase 1: Setup</span>
          <span class="px-3 py-1 bg-teal-950/80 border border-teal-glow/40 rounded-full text-xs text-teal-300 font-semibold">Fase 2: Execução</span>
          <span class="px-3 py-1 bg-teal-950/80 border border-teal-glow/40 rounded-full text-xs text-teal-300 font-semibold">Fase 3: Lockout</span>
        </div>
      </div>
    `;
  }
}

// Global initialization hook
window.StudioMacielBiomechanics3D = StudioMacielBiomechanics3D;
