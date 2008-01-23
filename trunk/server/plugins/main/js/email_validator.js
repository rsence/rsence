
EmailField = HTextControl.extend({
   constructor: function(_rect, _parentClass, _options) {
      this.base(_rect, _parentClass, _options);
   },

   onIdle: function(){
      if (this.active) {
         if (elem_get(this._inputElementId).value != this.value) {
            this.setValue(elem_get(this._inputElementId).value);
            this.emailvalidator(this.value);
         }
      }
   },

   emailvalidator: function(_email){
      if (_email.match(/^[a-z][\w\.-]*@[0-9A-Za-z][\w\.-]*[0-9A-Za-z]\.[A-Za-z][A-Za-z\.]*[A-Za-z]$/)){
         alert(_email);
      }
   }
});

EmailValidatorApp = HApplication.extend({
   constructor: function( clicker_id, email_id, valid_id ){

      this.base();

      this.emailWin = new HWindowControl(
         new HRect( 500,100,900,400 ),
         this,
         { label: 'Email Validator' }
      );

      this.emailField = new EmailField(
         new HRect( 120,120,270,140 ),
         this.emailWin.windowView,
         { value: 'Enter your email:' }
      );
      
      this.emailValidator = new HValidatorView(
        new HRect(0,0,20,20),
        this.emailField,
        { value: true, enabled: false }
      );

      this.validField = new HTextControl(
         new HRect( 120,140,270,160 ),
         this.emailWin.windowView,
         { value: 'validator' }
      );

      this.validateButton = new HClickButton(
         new HRect( 120, 160, 270, 180 ),
         this.emailWin.windowView,
         { label: 'Validate' }
      );

      var _emailVal = HValueManager.values[ email_id ];
      _emailVal.bind( this.emailField );

      var _validVal = HValueManager.values[ valid_id ];
      _validVal.bind( this.validField );

      var _clickVal = HValueManager.values[ clicker_id ];
      _clickVal.bind(this.validateButton);

   }

});
