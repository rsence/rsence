HDateTimePicker = HDatePicker.extend
  controlDefaults: HDatePicker.prototype.controlDefaults.extend
    fieldFormat: 'YYYY-MM-DD HH:mm:ss'
    refreshAfter: 3
    preserveTime: false
    preserveDate: false
    calendarPicker: false
