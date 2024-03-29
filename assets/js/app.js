// 1. Render songs
// 2. Scroll top
// 3. Play / pause / seek
// 4. CD rotate
// 5. Next / prev
// 6. Random 
// 7. Next / Repeat when ended 
// 8. Active song
// 9. Scroll active song into view  
// 10. Play song when click

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const progress = $('#progress')
const playlist = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {},
    songs: [
        {
            name: 'Querry',
            singer: 'QNT, Trung Trần, MCK',
            path: './assets/music/song1.mp3',
            image: './assets/img/img1.jpg',
        },
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './assets/music/song2.mp3',
            image: './assets/img/img2.jpg',
        },
        {
            name: 'Monody',
            singer: 'TheFatRat',
            path: './assets/music/song3.mp3',
            image: './assets/img/img3.jpg',
        },
        {
            name: 'Chúng Ta Của Hiện Tại',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song4.mp3',
            image: './assets/img/img4.jpg',
        },
        {
            name: 'Chúng Ta Không Thuộc Về Nhau',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song5.mp3',
            image: './assets/img/img5.jpeg',
        },
        {
            name: 'Cơn Mưa Xa Dần',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song6.mp3',
            image: './assets/img/img6.jpg',
        },
        {
            name: 'Hãy Trao Cho Anh',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song7.mp3',
            image: './assets/img/img7.jpg',
        },
        {
            name: 'Muộn Rồi Mà Sao Còn',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song8.mp3',
            image: './assets/img/img8.png',
        },
        {
            name: 'Nắng Ấm Ngang Qua',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song9.mp3',
            image: './assets/img/img9.jpg',
        },
        {
            name: 'Nơi Này Có Anh',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song10.mp3',
            image: './assets/img/img10.jpg',
        },
        {
            name: 'Sai Người Sai Thời Điểm',
            singer: 'Thanh Hưng',
            path: './assets/music/song11.mp3',
            image: './assets/img/img11.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem('PLAYER_STORAGE_KEY', JSON.stringify(this.config)) 
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>                  
                </div>
            ` 
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
          get: function () {
            return this.songs[this.currentIndex]
          }
        })
    },
    handleEvent: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate =  cdThumb.animate([
            { transform: 'rotate(360deg)' } // Quay 360 độ
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity, // Vô hạn 
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop  
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play 
        playBtn.onclick = function() {
            if(_this.isPlaying) {            
                audio.pause()
            } else {               
                audio.play()              
            } 

            // Khi song được play
            audio.onplay = function() {
                _this.isPlaying = true
                player.classList.add('playing')
                cdThumbAnimate.play()
            }

            // Khi song bị pause
            audio.onpause = function() {
                _this.isPlaying = false
                player.classList.remove('playing')
                cdThumbAnimate.pause()
            }
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToACtiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToACtiveSong()
        }

        // Xử lý bật / tắt random 
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý lặp lại một song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click() 
            }
        }

        // Lắng nghe hành vi click vào play list
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            if(songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                if(e.target.closest('.option')) {

                }
            }
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToACtiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'end'
            })
        }, 200)
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()
        
        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvent()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()
    