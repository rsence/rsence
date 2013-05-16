HTimePicker = HDatePicker.extend
  controlDefaults: HDatePicker.prototype.controlDefaults.extend
    fieldFormat: 'HH:mm:ss'
    refreshAfter: 3
    preserveTime: false
    preserveDate: true
    calendarPicker: false
