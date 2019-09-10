$(document).ready(function(e) {
// Author: Armaan Chandra

//functionality of the add-todo button. onclick it preforms new todo function
  $('#add-todo').button({
    icons: { primary: "ui-icon-circle-plus" }}).click(
      function() {
        $('#new-todo').dialog('open');
      });
      //function of creating a new item
      $('#new-todo').dialog({
        modal : true, autoOpen : false,
        buttons : {
          "Add task" : function () {
          var taskName = $('#task').val();
          var uName = $('#user').val();
          if (taskName === "") { return false; }
          var taskHTML = '<li><span class="done">%</span>';
          taskHTML += '<span class="delete">x</span>';
          taskHTML += '<span class="edit">+</span>'
          taskHTML += '<span class="task"></span>';
          taskHTML += '<span class="user"></span></li>';
          var $newTask = $(taskHTML);
          $newTask.find('.task').text(taskName);
          $newTask.find('.user').text(uName);
          $newTask.hide();
          $('#todo-list').prepend($newTask);
          $newTask.show('clip',250).effect('highlight',1000);
          //send the task and the user 
          $.ajax({
            url: '/items',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ task: taskName, name: uName }),
            success: function (response) {
              console.log('I think something happended: ' + taskName + " " + uName);
              console.log(response);
            }
          });

          $('#task').val("");
          $('#user').val("");
          $(this).dialog('close');
        },
        "Cancel" : function () { $(this).dialog('close'); }
        }
      });

      $('#todo-list').on('click', '.done', function() {
        var $taskItem = $(this).parent('li');
        $taskItem.slideUp(250, function() {
          var $this = $(this);
          $this.detach();
          $('#completed-list').prepend($this);
          $this.slideDown();
        });
      });

      $('.sortlist').sortable({
        connectWith : '.sortlist',
        cursor : 'pointer',
        placeholder : 'ui-state-highlight',
        cancel : '.delete,.done,.edit'
      });

      //CONFIRM DELETE
      $('#confirm-delete').dialog({ //refers the HTML, and opens the dialog box
        modal : true,
        autoOpen : false,
        buttons: {
          "Confirm": function(){
            $('#confirm-delete').data("select").parent('li').effect('puff', function() { $(this).remove(); });





            $(this).dialog('close');
          },
          "Cancel": function(){
            $(this).dialog('close');
          }
        }
      });

      $('.sortlist').on('click','.delete',function() {
        $('#confirm-delete').data("select", $(this)).dialog('open');
      });

      //EDITING TO BE DONE
      $('.sortlist').on('click', '.edit', function() {
        var $taskItemEdit = $(this).parent('li'); //this gets the item from the parents list
        $('#edit-task').dialog('open');

        $('#taskEdit').val($taskItemEdit.find('.task').text());
        $('#usernameEdit').val($taskItemEdit.find('.user').text());
        $('#edit-task').dialog({
          buttons: {
            "Confirm": function (){
              var taskName = $('#taskEdit').val();
              var uName = $('#usernameEdit').val();
              //if input is empty, exit function
              if (taskName === '') {
                return false;
              }
              //get current values and modify
              $taskItemEdit.find('.task').text(taskName);
              $taskItemEdit.find('.user').text(uName);
              $('#taskEdit').val(taskName);
              $('#usernameEdit').val(uName);
              $(this).dialog('close');
            },
            "Cancel": function() {
              $(this).dialog('close');
            }
          }
        });
      });

      $('#edit-task').dialog({
        modal:true,
        autoOpen:false
      });
    }); // end ready
