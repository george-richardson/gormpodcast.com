//functions
// Get all elements with the given name that is are direct children of the given parent.
function getDirectChildElementsByName(name, parent) {
  return Array.from(parent.getElementsByTagName(name)).filter(e => e.parentElement === parent)
}
// Get a single element with the given name that is a direct child of the given parent.
// In cases where multiple elements match then the first is returned.
function getDirectChildElementByName(name, parent) {
  return Array.from(parent.getElementsByTagName(name)).find(e => e.parentElement === parent)
}
// Converts time in seconds float to time in Minutes:Seconds
function toHoursMinuteSeconds(input) {
  return `${input > 3600 ? `${Math.floor(input / 3600)}:` : ""}${String(Math.floor(input % 3600 / 60)).padStart(2, '0')}:${String(Math.floor(input % 60)).padStart(2, '0')}`
}
// classes
class Player {
  constructor() {
    var self = this
    // Find UI elements
    this.elements = {}
    this.elements.podcastMeta = document.getElementById("podcastMeta")
    this.elements.podcastControls = document.getElementById("podcastControls")
    this.elements.podcastControlsTitle = document.getElementById("podcastControlsTitle")
    this.elements.podcastControlsProgressContainer = document.getElementById("podcastControlsProgressContainer")
    this.elements.podcastControlsProgressBar = document.getElementById("podcastControlsProgressBar")
    this.elements.podcastControlsPlayPause = document.getElementById("podcastControlsPlayPause")
    this.elements.podcastControlsNext = document.getElementById("podcastControlsNext")
    this.elements.podcastControlsPrevious = document.getElementById("podcastControlsPrevious")
    this.elements.podcastControlsCurrentTime = document.getElementById("podcastControlsCurrentTime")
    this.elements.podcastControlsDuration = document.getElementById("podcastControlsDuration")
    this.elements.podcastControlsAudio = document.getElementById("podcastControlsAudio")
    this.elements.podcastSelectedEpisode = document.getElementById("podcastSelectedEpisode")
    this.elements.podcastSelectedEpisodeTitle = document.getElementById("podcastSelectedEpisodeTitle")
    this.elements.podcastSelectedEpisodeDescription = document.getElementById("podcastSelectedEpisodeDescription")
    this.elements.podcastSelectedEpisodeDate = document.getElementById("podcastSelectedEpisodeDate")
    this.elements.podcastSelectedEpisodeImage = document.getElementById("podcastSelectedEpisodeImage")
    this.elements.podcastSelectedEpisodePlay = document.getElementById("podcastSelectedEpisodePlay")
    this.elements.podcastSelectedEpisodeDownload = document.getElementById("podcastSelectedEpisodeDownload")
    this.elements.podcastList = document.getElementById("podcastList")
    this.elements.podcastControlsPlayPath = document.getElementById("podcastControlsPlayPath")
    this.elements.podcastControlsPausePath = document.getElementById("podcastControlsPausePath")
    // Setup buttons and add event listeners
    this.elements.podcastControlsPlayPause.onclick = () => {
      if (self.elements.podcastControlsAudio.paused) {
        self.play()
      } else {
        self.pause()
      }
    }
    this.elements.podcastControlsProgressContainer.onclick = (event) => {
      var percent = event.offsetX / event.currentTarget.offsetWidth;
      self.elements.podcastControlsAudio.currentTime = percent * self.elements.podcastControlsAudio.duration;
    }
    // Setup audio event listeners
    this.elements.podcastControlsAudio.ontimeupdate = (event) => {
      this.elements.podcastControlsCurrentTime.textContent = toHoursMinuteSeconds(this.elements.podcastControlsAudio.currentTime)
      this.elements.podcastControlsProgressBar.style.width = ((this.elements.podcastControlsAudio.currentTime / this.elements.podcastControlsAudio.duration) * 100) + "%"
    }
    this.elements.podcastControlsAudio.ondurationchange = (event) => {
      this.elements.podcastControlsDuration.textContent = toHoursMinuteSeconds(this.elements.podcastControlsAudio.duration)
    }
    this.elements.podcastControlsAudio.onended = (event) => {
      if (self.playingEpisode.nextEpisode != null) {
        self.playEpisode(self.playingEpisode.nextEpisode)
      } else {
        self.pause()
        self.elements.podcastControlsAudio.currentTime = 0
      }
    }
    // Create feed and refresh once loaded.
    this.feed = new Feed(() => this.initialise())
  }
  initialise() {
    var self = this
    this.feed.episodes.forEach(episode => {
      self.elements.podcastList.appendChild(episode.constructListItem(() => self.selectEpisode(episode), () => self.playEpisode(episode)))
    })
    this.selectEpisode(this.feed.episodes[0])
    this.playEpisode(this.feed.episodes[0], false)
    this.elements.podcastSelectedEpisode.style.visibility = "visible"
  }
  playEpisode(episode, startNow = true) {
    let self = this
    if (this.playingEpisode != null) {
      this.playingEpisode.element.classList.remove("playing")
    }
    this.elements.podcastControlsCurrentTime.textContent = "00:00"
    this.playingEpisode = episode
    this.playingEpisode.element.classList.add("playing")
    this.elements.podcastControlsTitle.textContent = this.playingEpisode.title
    this.elements.podcastControlsAudio.src = this.playingEpisode.media
    if (startNow) {
      this.play()
    }

    if (episode.lastEpisode != null) {
      this.elements.podcastControlsPrevious.classList.remove("disabled")
      this.elements.podcastControlsPrevious.onclick = () => { self.playEpisode(episode.lastEpisode) }
    } else {
      this.elements.podcastControlsPrevious.classList.add("disabled")
    }

    if (episode.nextEpisode != null) {
      this.elements.podcastControlsNext.classList.remove("disabled")
      this.elements.podcastControlsNext.onclick = () => { self.playEpisode(episode.nextEpisode) }
    } else {
      this.elements.podcastControlsNext.classList.add("disabled")
    }
  }
  play() {
    this.elements.podcastControlsAudio.play()
    this.elements.podcastControlsPlayPath.style.visibility = "hidden"
    this.elements.podcastControlsPausePath.style.visibility = "visible"
  }
  pause() {
    this.elements.podcastControlsAudio.pause()
    this.elements.podcastControlsPlayPath.style.visibility = "visible"
    this.elements.podcastControlsPausePath.style.visibility = "hidden"
  }
  selectEpisode(episode) {
    var self = this
    if (this.selectedEpisode != null) {
      this.selectedEpisode.element.classList.remove("selected")
    }
    this.selectedEpisode = episode
    this.selectedEpisode.element.classList.add("selected")
    this.elements.podcastSelectedEpisodeTitle.textContent = this.selectedEpisode.title
    this.elements.podcastSelectedEpisodeDescription.innerHTML = this.selectedEpisode.description
    this.elements.podcastSelectedEpisodeDate.textContent = this.selectedEpisode.date
    this.elements.podcastSelectedEpisodeImage.src = this.selectedEpisode.image
    if (getComputedStyle(this.elements.podcastSelectedEpisode, null).display == "none") {
      this.playEpisode(episode)
    }
    this.elements.podcastSelectedEpisodeDownload.href = this.selectedEpisode.media
    this.elements.podcastSelectedEpisodePlay.onclick = () => self.playEpisode(self.selectedEpisode)
  }
}
class Feed {
  // Populate feed object from URL
  constructor(callback) {
    let self = this
    this.url = "https://feed.podbean.com/feed.gormpodcast.com/feed.xml"
    // Download XML of feed.
    fetch(this.url)
      .then(response => response.text())
      .then(xml => {
        // Parse XML
        let domparser = new DOMParser()
        let doc = domparser.parseFromString(xml, "application/xml")
        // Extract podcast information
        let channel = doc.getElementsByTagName("channel")[0]
        self.title = getDirectChildElementByName("title", channel).textContent
        self.description = getDirectChildElementByName("description", channel).textContent
        // Extract and construct episodes
        let items = Array.from(channel.getElementsByTagName("item"))
        self.episodes = []
        var lastEpisode = null
        for (var i = 0; i < items.length; i++) {
          let currentEpisode = new Episode(items[i], lastEpisode)
          lastEpisode?.setLastEpisode(currentEpisode)
          self.episodes.push(currentEpisode)
          lastEpisode = currentEpisode
        }
        // Fire off callback
        callback()
      })
      .catch(function (err) {
        console.error(err)
      });
  }
}
class Episode {
  constructor(item, nextEpisode) {
    this.title = item.getElementsByTagName("title")[0].textContent
    this.description = item.getElementsByTagName("description")[0].textContent
    this.media = item.getElementsByTagName("enclosure")[0].getAttribute("url")
    this.duration = item.getElementsByTagName("itunes:duration")[0].textContent
    this.date = new Date(item.getElementsByTagName("pubDate")[0].textContent).toDateString()
    this.image = item.getElementsByTagName("itunes:image")[0].getAttribute("href")
    this.nextEpisode = nextEpisode
    this.lastEpisode = null
  }

  constructListItem(onClick, onDblClick) {
    this.element = document.createElement("li")
    this.element.title = this.title

    let itemTitle = document.createElement("span")
    itemTitle.textContent = this.title
    itemTitle.classList.add("itemTitle")
    this.element.appendChild(itemTitle)

    let itemDuration = document.createElement("span")
    itemDuration.textContent = this.duration
    itemDuration.classList.add("itemDuration")
    this.element.appendChild(itemDuration)

    this.element.onclick = onClick
    this.element.ondblclick = onDblClick

    return this.element
  }

  setLastEpisode(lastEpisode) {
    this.lastEpisode = lastEpisode
  }
}
document.addEventListener('DOMContentLoaded', (event) => {
  let player = new Player()
})