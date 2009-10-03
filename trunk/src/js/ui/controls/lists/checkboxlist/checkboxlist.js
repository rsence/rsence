/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

HCheckboxList = HControl.extend({
  drawSubviews: function(){
    this.setStyle('border','1px solid #999');
    this.setStyle('overflow','auto');
  },
  listItems: [],
  CalCheckbox: HCheckbox.extend({
    setRowId: function(){
      var cal_ids = this.parent.options.cal_ids,
          ids_arr = cal_ids.value,
          row_id  = this.options.row_id;
      if(ids_arr.indexOf(row_id)===-1){
        var new_arr = [],
            i = 0;
        for(;i<ids_arr.length;i++){
          new_arr.push(ids_arr[i]);
        }
        new_arr.push(row_id);
        cal_ids.set(new_arr);
      }
    },
    unsetRowId: function(){
      var cal_ids = this.parent.options.cal_ids,
          ids_arr = cal_ids.value,
          row_id  = this.options.row_id;
      if(ids_arr.indexOf(row_id)!==-1){
        var new_arr = [],
            i = 0;
        for(;i<ids_arr.length;i++){
          if(ids_arr[i]!==row_id){
            new_arr.push(ids_arr[i]);
          }
        }
        cal_ids.set(new_arr);
      }
    },
    refreshValue: function(){
      this.base();
      if(this.value){
        this.setRowId();
      }
      else{
        this.unsetRowId();
      }
    }
  }),
  refreshValue: function(){
    var i;
    // destroy extra list
    for(i=this.value.length;i<this.listItems.length;i++){
      this.listItems[i][0].die();
    }
    var listItemCheckRect = HRect.nu(4,4,this.rect.right-8,28);
    for(i=0;i<this.value.length;i++){
      if(i>this.listItems.length-1){
        var isSelected = (this.options.cal_ids.value.indexOf(this.value[i].id)!==-1);
        this.listItems.push(
          this.CalCheckbox.nu(
            HRect.nu(listItemCheckRect),
            this, {
              label: this.value[i].title,
              value: isSelected,
              row_id: this.value[i].id
            }
          )
        );
        listItemCheckRect.offsetBy(0,24);
      }
    }
  }
});