export interface CALCULATE_PP {
    path: string;
    mode: number;
    mods: number;
    acc: number;
    nGeki: number;
    nKatu: number;
    n300: number;
    n100: number;
    n50: number;
    nMisses: number;
    combo: number;
    passedObjects: number;
    clockRate: number;
}
export interface CALCULATE_PP_RESPONSE {
    difficulty: {
        mode: number;
        stars: number;
        isConvert: boolean;
        aim: number;
        speed: number;
        flashlight: number;
        sliderFactor: number;
        speedNoteCount: number;
        od: number;
        hp: number;
        nCircles: number;
        nSliders: number;
        nSpinners: number;
        ar: number;
        maxCombo: number;
    };
    state: {
        maxCombo: number;
        nGeki: number;
        nKatu: number;
        n300: number;
        n100: number;
        n50: number;
        misses: number;
    };
    pp: number;
    ppAim: number;
    ppFlashlight: number;
    ppSpeed: number;
    ppAccuracy: number;
    effectiveMissCount: number;
}

export interface Settings {
    TimingWindowOpacity: number;
    barHeight: number;
    barWidth: number;
    colorBar: string;
    tickWidth: number;
    tickHeight: number;
    tickDuration: number;
    tickOpacity: number;
    fadeOutDuration: number;
    arrowSize: number;
    perfectArrowThreshold: number;
    colorArrowEarly: string;
    colorArrowLate: string;
    colorArrowPerfect: string;
    timingWindowHeight: number;
    isRounded: number;
    color300g: string;
    color300: string;
    color200: string;
    color100: string;
    color50: string;
    color0: string;
    showSD: boolean;
    visible: boolean;
}

export interface CommandData {
    command: string;
    message: Settings;
}

export interface WEBSOCKET_V2 {
    client: "stable" | "lazer";
    server: string;
    state: {
        number:
            | 0
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9
            | 10
            | 11
            | 12
            | 13
            | 14
            | 15
            | 16
            | 17
            | 18
            | 19
            | 20
            | 21
            | 22
            | 23;
        name:
            | "menu"
            | "edit"
            | "play"
            | "exit"
            | "selectEdit"
            | "selectPlay"
            | "selectDrawings"
            | "resultScreen"
            | "update"
            | "busy"
            | "unknown"
            | "lobby"
            | "matchSetup"
            | "selectMulti"
            | "rankingVs"
            | "onlineSelection"
            | "optionsOffsetWizard"
            | "rankingTagCoop"
            | "rankingTeam"
            | "beatmapImport"
            | "packageUpdater"
            | "benchmark"
            | "tourney"
            | "charts";
    };
    session: {
        playTime: number;
        playCount: number;
    };
    settings: {
        interfaceVisible: boolean;
        replayUIVisible: boolean;
        chatVisibilityStatus: {
            number: 0 | 1 | 2;
            name: "hidden" | "visible" | "visibleWithFriendsList";
        };
        leaderboard: {
            visible: boolean;
            type: {
                number: 0 | 1 | 2 | 3 | 4;
                name: "local" | "global" | "selectedmods" | "friends" | "country";
            };
        };
        progressBar: {
            number: 0 | 1 | 2 | 3 | 4;
            name: "off" | "pie" | "topRight" | "bottomRight" | "bottom";
        };
        bassDensity: number;
        resolution: {
            fullscreen: boolean;
            width: number;
            height: number;
            widthFullscreen: number;
            heightFullscreen: number;
        };
        client: {
            updateAvailable: boolean;
            branch: 0 | 1 | 2 | 3;
            version: string;
        };
        scoreMeter: {
            type: {
                number: 0 | 1 | 2;
                name: "none" | "colour" | "error";
            };
            size: number;
        };
        cursor: {
            useSkinCursor: boolean;
            autoSize: boolean;
            size: number;
        };
        mouse: {
            rawInput: boolean;
            disableButtons: boolean;
            disableWheel: boolean;
            sensitivity: number;
        };
        mania: {
            speedBPMScale: boolean;
            usePerBeatmapSpeedScale: boolean;
        };
        sort: {
            number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
            name: "artist" | "bpm" | "creator" | "date" | "difficulty" | "length" | "rank" | "title";
        };
        group: {
            number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;
            name:
                | "none"
                | "artist"
                | "bPM"
                | "creator"
                | "date"
                | "difficulty"
                | "length"
                | "rank"
                | "myMaps"
                | "search"
                | "show_All"
                | "title"
                | "lastPlayed"
                | "onlineFavourites"
                | "maniaKeys"
                | "mode"
                | "collection"
                | "rankedStatus";
        };
        skin: {
            useDefaultSkinInEditor: boolean;
            ignoreBeatmapSkins: boolean;
            tintSliderBall: boolean;
            useTaikoSkin: boolean;
            name: string;
        };
        mode: {
            number: 0 | 1 | 2 | 3;
            name: "osu" | "taiko" | "fruits" | "mania";
        };
        audio: {
            ignoreBeatmapSounds: boolean;
            useSkinSamples: boolean;
            volume: {
                master: number;
                music: number;
                effect: number;
            };
            offset: {
                universal: number;
            };
        };
        background: {
            dim: number;
            video: boolean;
            storyboard: boolean;
        };
        keybinds: {
            osu: {
                k1: string;
                k2: string;
                smokeKey: string;
            };
            fruits: {
                k1: string;
                k2: string;
                Dash: string;
            };
            taiko: {
                innerLeft: string;
                innerRight: string;
                outerLeft: string;
                outerRight: string;
            };
            quickRetry: string;
        };
    };
    profile: {
        userStatus: {
            number: 0 | 256 | 257 | 65537 | 65793;
            name: "reconnecting" | "guest" | "recieving_data" | "disconnected" | "connected";
        };
        banchoStatus: {
            number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
            name:
                | "idle"
                | "afk"
                | "playing"
                | "editing"
                | "modding"
                | "multiplayer"
                | "watching"
                | "unknown"
                | "testing"
                | "submitting"
                | "paused"
                | "lobby"
                | "multiplaying"
                | "osuDirect";
        };
        id: number;
        name: string;
        mode: {
            number: 0 | 1 | 2 | 3;
            name: "osu" | "taiko" | "fruits" | "mania";
        };
        rankedScore: number;
        level: number;
        accuracy: number;
        pp: number;
        playCount: number;
        globalRank: number;
        countryCode: {
            number: number;
            name: string;
        };
        backgroundColour: string;
    };
    beatmap: {
        isConvert: boolean;
        time: {
            live: number;
            firstObject: number;
            lastObject: number;
            mp3Length: number;
        };
        status: {
            number: 0 | 1 | 2 | 4 | 5 | 6 | 7;
            name: "unknown" | "notSubmitted" | "pending" | "ranked" | "approved" | "qualified" | "loved";
        };
        checksum: string;
        id: number;
        set: number;
        mode: {
            number: 0 | 1 | 2 | 3;
            name: "osu" | "taiko" | "fruits" | "mania";
        };
        artist: string;
        artistUnicode: string;
        title: string;
        titleUnicode: string;
        mapper: string;
        version: string;
        stats: {
            stars: {
                live: number;
                aim?: number;
                speed?: number;
                flashlight?: number;
                sliderFactor?: number;
                stamina?: number;
                rhythm?: number;
                color?: number;
                peak?: number;
                hitWindow?: number;
                total: number;
            };
            ar: {
                original: number;
                converted: number;
            };
            cs: {
                original: number;
                converted: number;
            };
            od: {
                original: number;
                converted: number;
            };
            hp: {
                original: number;
                converted: number;
            };
            bpm: {
                realtime: number;
                common: number;
                min: number;
                max: number;
            };
            objects: {
                circles: number;
                sliders: number;
                spinners: number;
                holds: number;
                total: number;
            };
            maxCombo: number;
        };
    };
    play: {
        playerName: string;
        mode: {
            number: 0 | 1 | 2 | 3;
            name: "osu" | "taiko" | "fruits" | "mania";
        };
        score: number;
        accuracy: number;
        healthBar: {
            normal: number;
            smooth: number;
        };
        hits: {
            geki: number;
            katu: number;
            sliderBreaks: number;
            sliderEndHits: number;
            sliderTickHits: number;
        };
        hitErrorArray: number[];
        combo: {
            current: number;
            max: number;
        };
        mods: {
            checksum: string;
            number: number;
            name: string;
            array: {
                acronym: string;
                settings?: object;
            };
            rate: number;
        };
        rank: {
            current: "XH" | "X" | "SH" | "S" | "A" | "B" | "C" | "D";
            maxThisPlay: "XH" | "X" | "SH" | "S" | "A" | "B" | "C" | "D";
        };
        pp: {
            current: number;
            fc: number;
            maxAchievedThisPlay: number;
            detailed: {
                current: {
                    aim: number;
                    speed: number;
                    accuracy: number;
                    difficulty: number;
                    flashlight: number;
                    total: number;
                };
                fc: {
                    aim: number;
                    speed: number;
                    accuracy: number;
                    difficulty: number;
                    flashlight: number;
                    total: number;
                };
            };
        };
        unstableRate: number;
    };
    leaderboard: {
        isFailed: boolean;
        position: number;
        team: number;
        id: number;
        name: string;
        score: number;
        accuracy: number;
        hits: {
            geki: number;
            katu: number;
        };
        combo: {
            current: number;
            max: number;
        };
        mods: {
            checksum: string;
            number: number;
            name: string;
            array: {
                acronym: string;
                settings?: object;
            };
            rate: number;
        };
        rank: "XH" | "X" | "SH" | "S" | "A" | "B" | "C" | "D";
    };
    performance: {
        // biome-ignore lint/complexity/noBannedTypes: off
        accuracy: {};
        graph: {
            series: {
                name:
                    | "aim"
                    | "aimNoSliders"
                    | "flashlight"
                    | "speed"
                    | "color"
                    | "rhythm"
                    | "stamina"
                    | "movement"
                    | "strains";
                data: number[];
            };
            xaxis: number[];
        };
    };
    resultsScreen: {
        scoreId: number;
        playerName: string;
        mode: {
            number: 0 | 1 | 2 | 3;
            name: "osu" | "taiko" | "fruits" | "mania";
        };
        score: number;
        accuracy: number;
        hits: {
            geki: number;
            katu: number;
            sliderEndHits: number;
            sliderTickHits: number;
        };
        mods: {
            checksum: string;
            number: number;
            name: string;
            array: {
                acronym: string;
                settings?: object;
            };
            rate: number;
        };
        maxCombo: number;
        rank: "XH" | "X" | "SH" | "S" | "A" | "B" | "C" | "D";
        pp: {
            current: number;
            fc: number;
        };
        createdAt: string;
    };
    folders: {
        game: string;
        skin: string;
        songs: string;
        beatmap: string;
    };
    files: {
        beatmap: string;
        background: string;
        audio: string;
    };
    directPath: {
        beatmapFile: string;
        beatmapBackground: string;
        beatmapAudio: string;
        beatmapFolder: string;
        skinFolder: string;
    };
    tourney: {
        scoreVisible: boolean;
        starsVisible: boolean;
        ipcState: number;
        bestOF: number;
        team: {
            left: string;
            right: string;
        };
        points: {
            left: number;
            right: number;
        };
        chat: {
            team: string;
            name: string;
            message: string;
            timestamp: string;
        };
        totalScore: {
            left: number;
            right: number;
        };
        clients: {
            ipcId: number;
            team: "left" | "right";
            user: {
                id: number;
                name: string;
                country: string;
                accuracy: number;
                rankedScore: number;
                playCount: number;
                globalRank: number;
                totalPP: number;
            };
            beatmap: {
                stats: {
                    stars: {
                        live: number;
                        aim?: number;
                        speed?: number;
                        flashlight?: number;
                        sliderFactor?: number;
                        stamina?: number;
                        rhythm?: number;
                        color?: number;
                        peak?: number;
                        hitWindow?: number;
                        total: number;
                    };
                    ar: {
                        original: number;
                        converted: number;
                    };
                    cs: {
                        original: number;
                        converted: number;
                    };
                    od: {
                        original: number;
                        converted: number;
                    };
                    hp: {
                        original: number;
                        converted: number;
                    };
                    bpm: {
                        realtime: number;
                        common: number;
                        min: number;
                        max: number;
                    };
                    objects: {
                        circles: number;
                        sliders: number;
                        spinners: number;
                        holds: number;
                        total: number;
                    };
                    maxCombo: number;
                };
            };
            play: {
                playerName: string;
                mode: {
                    number: 0 | 1 | 2 | 3;
                    name: "osu" | "taiko" | "fruits" | "mania";
                };
                score: number;
                accuracy: number;
                healthBar: {
                    normal: number;
                    smooth: number;
                };
                hits: {
                    geki: number;
                    katu: number;
                    sliderBreaks: number;
                    sliderEndHits: number;
                    sliderTickHits: number;
                };
                hitErrorArray: number[];
                combo: {
                    current: number;
                    max: number;
                };
                mods: {
                    checksum: string;
                    number: number;
                    name: string;
                    array: {
                        acronym: string;
                        settings?: object;
                    };
                    rate: number;
                };
                rank: {
                    current: "XH" | "X" | "SH" | "S" | "A" | "B" | "C" | "D";
                    maxThisPlay: "XH" | "X" | "SH" | "S" | "A" | "B" | "C" | "D";
                };
                pp: {
                    current: number;
                    fc: number;
                    maxAchievedThisPlay: number;
                    detailed: {
                        current: {
                            aim: number;
                            speed: number;
                            accuracy: number;
                            difficulty: number;
                            flashlight: number;
                            total: number;
                        };
                        fc: {
                            aim: number;
                            speed: number;
                            accuracy: number;
                            difficulty: number;
                            flashlight: number;
                            total: number;
                        };
                    };
                };
                unstableRate: number;
            };
        };
    };
}
export interface WEBSOCKET_V2_PRECISE {
    currentTime: number;
    keys: {
        k1: {
            isPressed: boolean;
            count: number;
        };
        k2: {
            isPressed: boolean;
            count: number;
        };
        m1: {
            isPressed: boolean;
            count: number;
        };
        m2: {
            isPressed: boolean;
            count: number;
        };
    };
    hitErrors: number[];
    tourney: {
        ipcId: number;
        hitErrors: Int16Array;
        keys: {
            k1: {
                isPressed: boolean;
                count: number;
            };
            k2: {
                isPressed: boolean;
                count: number;
            };
            m1: {
                isPressed: boolean;
                count: number;
            };
            m2: {
                isPressed: boolean;
                count: number;
            };
        };
    };
}
