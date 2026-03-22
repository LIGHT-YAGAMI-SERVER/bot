// bot.js
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const mcDataLib = require('minecraft-data')

// 🔥 CONFIG
const PASSWORD = "Ajay12345"
const OWNER = "LIGHT_YAGAMI"
const HOST = "lightyagamiii.falix.pro"
const PORT = 25565

function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: 'GOAT',
  })

  // load pathfinder plugin
  bot.loadPlugin(pathfinder)

  let loggedIn = false
  let following = false

  // helper: get owner entity
  function getOwner() {
    if (!bot.players) return null
    if (!bot.players[OWNER]) return null
    return bot.players[OWNER].entity
  }

  bot.once('spawn', () => {
    console.log('✅ Bot joined!')

    let mcData
    try {
      mcData = mcDataLib(bot.version)
    } catch (err) {
      console.log('❌ Failed to load mcData:', err.message)
      return
    }

    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)
  })

  // ===== MESSAGE HANDLER =====
  bot.on('message', (msg) => {
    const text = msg.toString().toLowerCase()
    console.log('📩 Server:', text)

    // LOGIN
    if (!loggedIn && text.includes("login")) {
      bot.chat(`/login ${PASSWORD}`)
      loggedIn = true
      console.log("🔐 Logged in")
    }

    // REGISTER
    if (!loggedIn && text.includes("register")) {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      console.log("📝 Registered")
    }

    // FOLLOW OWNER
    if (text.includes("follow me")) {
      const target = getOwner()
      if (!target) {
        bot.chat("❌ Can't see you GOAT!")
        return
      }
      following = true
      bot.chat("👣 Following GOAT!")
      bot.pathfinder.setGoal(new goals.GoalFollow(target, 2), true)
    }

    // STOP FOLLOWING
    if (text.includes("stop")) {
      following = false
      bot.pathfinder.setGoal(null)
      bot.chat("🛑 Stopped!")
    }

    // AUTO ACCEPT TPA
    if (text.includes("has requested to teleport") || text.includes("tpa request")) {
      bot.chat("/tpaccept")
      bot.chat("📡 Teleported!")
    }

    // ===== BASIC AI CHAT (savage + fun) =====
    if (text.includes("ai")) {
      const msgWithoutAi = text.replace("ai", "").trim()
      const reply = generateAIFreeReply(msgWithoutAi)
      bot.chat(reply)
    }
  })

  // ===== AUTO ATTACK nearby mobs =====
  setInterval(() => {
    if (!bot.entity) return

    const enemy = bot.nearestEntity(e =>
      e.type === 'mob' &&
      e.position.distanceTo(bot.entity.position) < 5
    )

    if (enemy) bot.attack(enemy)
  }, 2000)

  // ===== PROTECT OWNER =====
  setInterval(() => {
    const owner = getOwner()
    if (!owner) return

    const enemy = bot.nearestEntity(e =>
      e.type === 'mob' &&
      e.position.distanceTo(owner.position) < 6
    )

    if (enemy) bot.attack(enemy)
  }, 2000)

  // ===== AUTO EAT =====
  setInterval(() => {
    if (!bot.entity) return

    if (bot.food < 15) {
      const food = bot.inventory.items().find(i =>
        i.name.includes("bread") || i.name.includes("beef")
      )

      if (food) {
        bot.equip(food, 'hand')
        bot.consume()
      }
    }
  }, 5000)

  // ===== AUTO TPA =====
  setInterval(() => {
    if (!loggedIn) return
    const owner = getOwner()
    if (!owner) {
      bot.chat(`/tpa ${OWNER}`)
      console.log("📡 Sending TPA request...")
    }
  }, 20000)

  // ===== WANDER WHEN IDLE =====
  setInterval(() => {
    if (!following && bot.entity) {
      const x = bot.entity.position.x + (Math.random() * 6 - 3)
      const y = bot.entity.position.y
      const z = bot.entity.position.z + (Math.random() * 6 - 3)
      bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z))
    }
  }, 10000)

  // ===== ANTI AFK =====
  setInterval(() => {
    if (!bot.entity) return
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)
  }, 8000)

  // ===== RECONNECT =====
  bot.on('end', () => {
    console.log('🔁 Reconnecting in 15s...')
    setTimeout(createBot, 15000)
  })

  bot.on('kicked', reason => {
    console.log('❌ Kicked:', JSON.stringify(reason))
  })

  bot.on('error', err => {
    console.log('❌ Error:', err.message)
  })
}

// ===== FREE AI FUNCTION =====
function generateAIFreeReply(msg) {
  const savageReplies = [
    "Bruh, stop asking dumb stuff.",
    "Lmao, seriously?",
    "You think I'm your therapist?",
    "I dunno, maybe try reading a book.",
    "Haha, GOAT energy, you wish!"
  ]

  const friendlyReplies = [
    "😂 True that!",
    "💀 That’s insane!",
    "😎 You got it!",
    "🔥 GOAT vibes!",
    "😂 Mood!"
  ]

  // 50% chance savage, 50% friendly
  const pick = Math.random() < 0.5 ? savageReplies : friendlyReplies

  // if message has a question mark, add thoughtful reply
  if (msg.includes("?")) pick.push("🤔 Hmm, good question...")

  return pick[Math.floor(Math.random() * pick.length)]
}

// ===== START BOT =====
createBot()
