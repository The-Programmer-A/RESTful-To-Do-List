$(document).ready(function(e) {
  // Author: Armaan Chandra

  //get from the database and show results on start up
  $.ajax({
    url: "/items",
    method: "GET",
    contentType: "application/json",
    success: function(response) {
      var todoList = $("todo-list");
      todoList.html("");
      response.results.forEach(element => {
        //evaluate the status. Don't render completed status.
        if(element.status == "Completed"){
          return;
        }
        var taskHTML = '<li><span class="done">%</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="edit">+</span>';
        taskHTML += '<span class="task"></span>';
        taskHTML += '<span class="user"></span></li>';
        var $newTask = $(taskHTML);
        $newTask.find(".task").text(element.item);
        $newTask.find(".user").text(element.username);
        $newTask.hide();
        $("#todo-list").prepend($newTask);
        $newTask.show("clip", 250).effect("highlight", 1000);
      });
    }
  });
  //get from the database all completed tasks and show results on start up
  $.ajax({
    url: "/itemsCompleted",
    method: "GET",
    contentType: "application/json",
    success: function(response) {
      var todoList = $("todo-list");
      todoList.html("");
      response.results.forEach(element => {
        var taskHTML = '<li><span class="done">%</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="task"></span>';
        taskHTML += '<span class="user"></span></li>';
        var $newTask = $(taskHTML);
        $newTask.find(".task").text(element.item);
        $newTask.find(".user").text(element.username);
        $newTask.hide();
        $("#completed-list").prepend($newTask);
        $newTask.show("clip", 250).effect("highlight", 1000);
      });
    }
  });

  //functionality of the add-todo button. onclick it preforms new todo function
  $("#add-todo")
    .button({
      icons: { primary: "ui-icon-circle-plus" }
    })
    .click(function() {
      $("#new-todo").dialog("open");
    });
  //function of creating a new item
  $("#new-todo").dialog({
    modal: true,
    autoOpen: false,
    buttons: {
      "Add task": function() {
        //creating the new objects from UI and prepending them to todo-list
        var taskName = $("#task").val();
        var uName = $("#user").val();
        if (taskName === "") {
          return false;
        }

        $.ajax({
          url: "/items",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ task: taskName, name: uName }), //send the task and the user
          success: function(response) {
            var taskHTML = '<li><span class="done">%</span>';
            taskHTML += '<span class="delete">x</span>';
            taskHTML += '<span class="edit">+</span>';
            taskHTML += '<span class="task"></span>';
            taskHTML += '<span class="user"></span></li>';
            var $newTask = $(taskHTML);
            $newTask.find(".task").text(taskName);
            $newTask.find(".user").text(uName);
            $newTask.hide();
            //add the new item to the list
            $.ajax({
              url: "/items",
              method: "GET",
              contentType: "application/json",
              success: function(response) {
                $("#todo-list").prepend($newTask);
                $newTask.show("clip", 250).effect("highlight", 1000);
              }
            });
          }
        });
        $("#task").val("");
        $("#user").val("");
        $(this).dialog("close");
      },
      Cancel: function() {
        $(this).dialog("close");
      }
    }
  });

  //make the todo list sortable. Moving to the completed list
  $("#todo-list").on("click", ".done", function() {
    var $taskItem = $(this).parent("li");
    //function to make the list slideable and transferable to completed list.
    $taskItem.slideUp(250, function() {
      var $this = $(this);
      $this.detach();
      $this.slideDown();
    });
    //patch the status to be completed.
    //on the get requrest to show all. have a statement that evaluates the status and adds to the
    //correct list based on the status.
    var taskDone = $taskItem.find(".task").text();
    var usernameDone = $taskItem.find(".user").text();
    $.ajax({
      url: "/updateStatus",
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify({
        task: taskDone,
        name: usernameDone,
        status: "Completed"
      }),
      success: function(response) {
        var taskHTML = '<li><span class="done">%</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="task"></span>';
        taskHTML += '<span class="user"></span></li>';
        var $newTask = $(taskHTML);
        $newTask.find(".task").text(taskDone);
        $newTask.find(".user").text(usernameDone);
        $newTask.hide();
        //add the new item to the list
        $.ajax({
          url: "/itemsCompleted",
          method: "GET",
          contentType: "application/json",
          success: function(response) {
            $("#completed-list").prepend($newTask);
            $newTask.show("clip", 250).effect("highlight", 1000);
          }
        });
      }
    });
  });

  $(".sortlist").sortable({
    connectWith: ".sortlist",
    cursor: "pointer",
    placeholder: "ui-state-highlight",
    cancel: ".delete,.done,.edit"
  });

  //CONFIRM DELETE
  $("#confirm-delete").dialog({
    //refers the HTML, and opens the dialog box
    modal: true,
    autoOpen: false,
    buttons: {
      Confirm: function() {
        $("#confirm-delete")
          .data("select")
          .parent("li")
          .effect("puff", function() {
            $(this).remove();
          });
        $(this).dialog("close");
      },
      Cancel: function() {
        $(this).dialog("close");
      }
    }
  });

  //pop up confirmation of deletion
  $(".sortlist").on("click", ".delete", function() {
    var $taskItemDel = $(this).parent("li");
    var taskDelete = $taskItemDel.find(".task").text();
    var usernameDelete = $taskItemDel.find(".user").text();
    $.ajax({
      url: "/deleteItems",
      method: "DELETE",
      contentType: "application/json",
      data: JSON.stringify({ task: taskDelete, name: usernameDelete }), //need to get the current task and username
      success: function(response) {
      }
    });
    $("#confirm-delete")
      .data("select", $(this))
      .dialog("open");
  });

  //EDITING TO BE DONE
  $(".sortlist").on("click", ".edit", function() {
    var $taskItemEdit = $(this).parent("li"); //this gets the item from the parents list
    $("#edit-task").dialog("open");

    $("#taskEdit").val($taskItemEdit.find(".task").text());
    $("#usernameEdit").val($taskItemEdit.find(".user").text());

    var oldTask = $taskItemEdit.find(".task").text();
    var oldUser = $taskItemEdit.find(".user").text();

    $("#edit-task").dialog({
      buttons: {
        Confirm: function() {
          var newTask = $("#taskEdit").val();
          var newUsername = $("#usernameEdit").val();
          //if input is empty, exit function
          if (newTask === "") {
            return false;
          }

          $taskItemEdit.find(".task").text(newTask);
          $taskItemEdit.find(".user").text(newUsername);
          $("#taskEdit").val(newTask);
          $("#usernameEdit").val(newUsername);

          // ajax call to update entries in the database
          $.ajax({
            url: "/updateItems",
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
              oldTask: oldTask,
              oldName: oldUser,
              newTask: newTask,
              newName: newUsername
            }), //need to get the current task and username
            success: function(response) {
            }
          });
          $(this).dialog("close");
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
    });
  });

  $("#edit-task").dialog({
    modal: true,
    autoOpen: false
  });
}); // end ready
