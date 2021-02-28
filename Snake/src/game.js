
//Phaser config, täässä asetetaan Phaserin tyyppi, ikkunan leveys ja korkeus, taustaväri ja "scenet" jotka ladataan. 
var config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#bfcc00',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
//Globaalit muuttujat
var kaarme;
var ruoka;
var kursori;
//Suuntien vakiot
var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;

var peli = new Phaser.Game(config);

//Preload ladataan grafiikat ennen kuin otamme ne käyttöön.
//Preload ajetaan ennen kuin luomme funktiot
function preload ()
{
    this.load.image('ruoka', 'assets/ruokaAlpha.png');
    this.load.image('body', 'assets/bodyRe.png');
}

//Createssa luomme funktiot Ruoka jolla on syo funktio ja Kaarme jolla on update ja liikkumiseen tarvittavat toiminnot 
function create ()
{
    //Ruoka siis "omena" jota Kaarme syö jonka jälkeen käärme kasvaa pituutta.
    var Ruoka = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        //Ruoka:lla on scene ja x ja y koordinaatit.
        //
        function Ruoka (scene, x, y)
        {
            Phaser.GameObjects.Image.call(this, scene)
            //Aseta tekstuuri 'ruoka'
            this.setTexture('ruoka');
            //Aseta positio
            this.setPosition(x * 16, y * 16);
            this.setOrigin(0);

            this.total = 0;

            scene.children.add(this);
        },

        //Syo lisaa total:n aina yksi
        syo: function ()
        {
            this.total++;
        }

    });

    //Kaarme luokka
    var Kaarme = new Phaser.Class({

        initialize:
        //Kaarme scene x ja y koordinaatit
        function Kaarme (scene, x, y)
        {
            //Pään positio, jotka ovat sijainnissa x ja y
            this.headPosition = new Phaser.Geom.Point(x, y);
            //Lisataan bodyyn group
            this.body = scene.add.group();
            //Luodaan pää
            this.head = this.body.create(x * 16, y * 16, 'body');
            this.head.setOrigin(0);
            //asetetaan Kaarme eläväksi
            this.alive = true;
            //Asetetaan Kaarmeen nopeus
            this.speed = 100;
            //Asetetaan liikkumisaika 0
            this.moveTime = 0;
            //Annetaan hännälle uusi piste
            this.tail = new Phaser.Geom.Point(x, y);

            //Asetetaan liikkumissuunta
            this.heading = RIGHT;
            this.direction = RIGHT;
        },

        //update Funktio paivittaa ja uudelleen piirtää pelin objektit.
        update: function (time)
        {
            if (time >= this.moveTime)
            {
                return this.move(time);
            }
        },

        //Kaannytaan vasemmalle
        faceLeft: function ()
        {
            //Tarkistetaan onko suunta ylos tai alas
            if (this.direction === UP || this.direction === DOWN)
            {
                this.heading = LEFT;
            }
        },
        //Kaannyttaan oikealle
        faceRight: function ()
        {
            //Tarkistetaan onko suunta ylos tai alas
            if (this.direction === UP || this.direction === DOWN)
            {
                this.heading = RIGHT;
            }
        },
        //Kannytaan ylos
        faceUp: function ()
        {
            //Tarkistetaan onko suunta vasen tai oikea
            if (this.direction === LEFT || this.direction === RIGHT)
            {
                this.heading = UP;
            }
        },
        //Kaannytaan alas
        faceDown: function ()
        {
            //Tarkistetaan onko suunta vasen tai oikea
            if (this.direction === LEFT || this.direction === RIGHT)
            {
                this.heading = DOWN;
            }
        },

        //Liikkumis funktio, liikuttaa Kaarmetta riippuen valitusta suunnasta vakiona oikealle
        move: function (time)
        {
       
           //Tarkistaa mikä suunta on Kaarmeella ja liikuttaa lisaamalla/vähentämällä x-positioon tai y-positioon 
            switch (this.heading)
            {
                case LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40);
                    break;

                case RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
                    break;

                case UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
                    break;

                case DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
                    break;
            }

            //Korvataan this.direction this.heading arvolla jotta Kaarmeen suunta muuttuu
            this.direction = this.heading;

           
            // Päivitä body ja lisää viimeiset koordinaatit this.tail
            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

            // Tarkistetaan onko jollain bodyn osalla sama koordinaatti kuin Kaarmeen päällä
            // Jos on niin Kaarme syö oman häntäsä ja peli päättyy.
            var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

            //Tarkista onko hitBody True jos on peli päättyy
            if (hitBody)
            {
                console.log('dead');

                this.alive = false;

                return false;
            }
            else
            {
                // Paivitä ajastin seuraavalle liikkeelle
                this.moveTime = time + this.speed;

                return true;
            }
        },

        //grow funktio lisää uuden kehon osan 'body' Kaarmeen perään.
        grow: function ()
        {
            var newPart = this.body.create(this.tail.x, this.tail.y, 'body');

            newPart.setOrigin(0);
        },

        //collideWithFood funktio tarkistaa onko pään ja ruuan x- ja y-koordinaatit samat jos on Kaarme kasvaa ja syo
        collideWithFood: function (ruoka)
        {
            if (this.head.x === ruoka.x && this.head.y === ruoka.y)
            {
                this.grow();

                ruoka.syo();

                //  Kasvata Kaarmeen nopeutta joka 5 ruuan jälkeen
                if (this.speed > 20 && ruoka.total % 5 === 0)
                {
                    this.speed -= 5;
                }

                return true;
            }
            else
            {
                return false;
            }
        },

        updateGrid: function (grid)
        {
            //  Remove all body pieces from valid positions list
            // Poista kaikki kehon osat 'body' olemassa olevien paikkojen listasta
            this.body.children.each(function (segment) {

                var bx = segment.x / 16;
                var by = segment.y / 16;

                grid[by][bx] = false;

            });

            return grid;
        }

    });

    ruoka = new Ruoka(this, 3, 4);

    kaarme = new Kaarme(this, 8, 8);

    //  Luo näppäimistön kontrollit
    kursori = this.input.keyboard.createCursorKeys();
}

//update funktio päivittää Kaarmeen kontrolleja ja Kaarmeen tilaa (siis onko elossa vai ei)
function update (time, delta)
{
    if (!kaarme.alive)
    {
        return;
    }

    //Kun pelaaja painaa kontrolleja valitaan kontrolli ja ajetaan sille asetettu funktio, siis paina vasemmalle ja Kaarme menee vasemmalle 
    if (kursori.left.isDown)
    {
        kaarme.faceLeft();
    }
    else if (kursori.right.isDown)
    {
        kaarme.faceRight();
    }
    else if (kursori.up.isDown)
    {
        kaarme.faceUp();
    }
    else if (kursori.down.isDown)
    {
        kaarme.faceDown();
    }

    if (kaarme.update(time))
    {
        //kaarme.update kohdalla tarkistamme osuuko Kaarme ruokaan.

        if (kaarme.collideWithFood(ruoka))
        {
            repositionFood();
        }
    }
}

//Sijoitetaan ruoka jonnekkin 40x30 gridille. Poikkeuksena itse Kaarmeen päälle ei voi sijoittaa ruokaa.
//Jos ei koordinaattia johon ruuan voi sijoittaa pelaaja voittaa pelin.
function repositionFood ()
{

    //Tehdään tyhjä ruudukko johon lisätään kaikki 40x30 kohdat ja asetetaan ne todeksi

    var testGrid = [];

    for (var y = 0; y < 30; y++)
    {
        testGrid[y] = [];

        for (var x = 0; x < 40; x++)
        {
            testGrid[y][x] = true;
        }
    }

    kaarme.updateGrid(testGrid);

    //  Poistetaan kaikki ei kelvolliset kohdat
    var validLocations = [];

    for (var y = 0; y < 30; y++)
    {
        for (var x = 0; x < 40; x++)
        {
            //Jos kohta on kelvollinen sijoitetaan se ruudukkoon
            if (testGrid[y][x] === true)
            {
                validLocations.push({ x: x, y: y });
            }
        }
    }

    if (validLocations.length > 0)
    {
        //  Käytetään satunnaisuutta ruudukon valitsemisessa
        var pos = Phaser.Math.RND.pick(validLocations);

        //  Sijoitetaan siiuen ruoka
        ruoka.setPosition(pos.x * 16, pos.y * 16);

        return true;
    }
    else
    {
        return false;
    }
}
