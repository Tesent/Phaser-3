class Example extends Phaser.Scene{
    constructor() {
        super({key:"example"});
    }

    preload(){
        this.load.image('body', 'assets/body.png');
        this.load.image('head', 'assets/headAlpha.png');
    }




    create(){
        //this.image = this.add.image(400,300,'head');
        
            //hae korkeus ja leveys pelin config tiedostosta
            //var h = game.config.height;
            //var w = game.config.width;
         //
            //var width = 200
            
            var face = this.add.image(400, 200, "head");
             
            //set the width of the sprite
            //face.displayWidth = width;
            ////scale evenly
            //face.scaleY = face.scaleX;
        
        

            this.input.keyboard.on('keyup_D', function(event){
                face.x += 10;
            });
    }
}