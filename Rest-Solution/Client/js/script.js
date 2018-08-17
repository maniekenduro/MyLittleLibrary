$(function(){
  //stała adresu api
  const apiURL = "http://localhost:49297/api/";
  //wywołanie funkcji wyswietlających listy ksiazek, czytelnikow i wypozyczen
  GetAllBooks();
  GetAllReaders();
  GetAllLendBook();

//eventy do tabeli ksiazek
  //event przycisku Edit
  $("#booksTable").on("click","button.editBook",function (e) {
    //console.log("EDIT ", this);
    //zdefiniowanie przycisku dodaj/edutuj
    var EditBookButton = $("#addBookButton");
    //zmiana nazwy dodaj na edytuj przycisku
    EditBookButton.html("Edytuj");
    //zdefiniowanie pola formularza tytul
    var TitleEditForm = $("#inputTitleForm");
    //zdefiniowanie pola formularza author
    var AuthorEditForm = $("#inputAuthorForm");
    //zdefiniowanie ukrytego pola formularza id
    var BookIDForm = $("#hiddenBookID");
    //odszkanie wartosci ID edytowanej ksiazki
    var bookID = $(this).closest("tr[data-book-id]").attr("data-book-id");
    //odszukanie wartosci edytowanego tytulu podanego potem do formularza
    var TitleEditVal = $(this).closest("tr[data-book-id]").children().eq(0).html();
    //odszukanie wartosci edytowanego autora podanego potem do formularza
    var AuthorEditVal = $(this).closest("tr[data-book-id]").children().eq(1).html();
    //sprawdzenie poprawnosci działania powyzszych funkcji
    //console.log(TitleEditVal);
    //console.log(AuthorEditVal);
    //wpisanie wartosci edytowanych do formularza
    TitleEditForm.val(TitleEditVal);
    AuthorEditForm.val(AuthorEditVal);
    BookIDForm.val(bookID);
  });

  //event przycisku Delete
  $("#booksTable").on("click","button.deleteBook", function () {
    //odszukanie wartosci id ksiazki
    var bookID = $(this).closest("tr[data-book-id]").attr("data-book-id");
    //console.log(typeof(bookID));
    //usunięcie ksiazki po podanym ID
    RemoveBookByID(bookID);
  })

  //event przycisku Lend
  $("#booksTable").on("click","button.lendBook",function (e) {
    //zmiana stylu wyswietlania przycisku wybierz
    $(".chooseReader").css("display","inline");
    //odszukanie wartosci id ksiazki
    var bookID = $(this).closest("tr[data-book-id]").attr("data-book-id");
    //wyznaczenie aktualnej daty
    var lendDate = new Date().toISOString();
    //stworzenie dodatkowego eventu do wybrania czytelnika oraz funkcji CreateLendBook
    $("#readersTable").on("click","button.chooseReader",function (e) {
      //odszukanie wartosci id czytelnika
      var readerID = $(this).closest("tr[data-reader-id]").attr("data-reader-id");
      //zdefiniowanie obiektu nowego wypozyczenia
      var newLend = {
        BookID: bookID,
        ReaderID: readerID,
        LendDate: lendDate
      }
      //console.log(newLend);
      CreateLendBook(newLend);
      //ukrycie przycisku wybierz
      $(".chooseReader").css("display","hidden");
    })
  })

//eventy do tabeli czytelnicy
  //event przycisku Edit
  $("#readersTable").on("click","button.editReader",function (e) {
    //zdefiniowanie przycisku dodaj/edutuj
    var EditReaderButton = $("#addReaderButton");
    //zmiana nazwy dodaj na edytuj przycisku
    EditReaderButton.html("Edytuj");
    //zdefiniowanie pola formularza imienia i nazwiska czytelnika
    var NameEditForm = $("#inputNameForm");
    //zdefiniowanie pola formularza wieku czytelnika
    var AgeEditForm = $("#inputAgeForm");
    //zdefiniowanie ukrytego pola formularza id czytelnika
    var ReaderIDForm = $("#hiddenReaderID");
    //odszkanie wartosci ID edytowanego czytelnika
    var readerID = $(this).closest("tr[data-reader-id]").attr("data-reader-id");
    //odszukanie wartosci edytowanej nazwy czytelnika podanego potem do formularza
    var NameEditVal = $(this).closest("tr[data-reader-id]").children().eq(0).html();
    //odszukanie wartosci edytowanego wieku podanego potem do formularza
    var AgeEditVal = $(this).closest("tr[data-reader-id]").children().eq(1).html();
    //wpisanie wartosci edytowanych do formularza
    NameEditForm.val(NameEditVal);
    AgeEditForm.val(AgeEditVal);
    ReaderIDForm.val(readerID);
  })

  //event przycisku Delete
  $("#readersTable").on("click","button.deleteReader", function () {
    //odszkanie wartosci ID usuwanego czytelnika
    var readerID = $(this).closest("tr[data-reader-id]").attr("data-reader-id");
    RemoveReaderByID(readerID);
  })

//eventy do tabeli wypozyczen
  //event przycisku Oddano
  $("#lendTable").on("click","button.given",function (e) {
    //odszkanie wartosci ID usuwanego wypozyczenia
    var lendID = $(this).closest("tr[data-lend-id]").attr("data-lend-id");
    console.log(lendID);
    RemoveLendByID(lendID);
  })

//Czysczenie pola tytul formularza
function ClearTitleInput(){
  $("#inputTitleForm").val("");
}
//Czysczenie pola autor formularza
function ClearAuthorInput(){
  $("#inputAuthorForm").val("");
}
//Czysczenie pola Name formularza
function ClearNameInput(){
  $("#inputNameForm").val("");
}
//Czysczenie pola age formularza
function ClearAgeInput(){
  $("#inputAgeForm").val("");
}

//funkcja wyswietlająca komentarze na gorze strony
function ShowComment(text, status){
  var CommentDiv = $("#comment");
  var CommentClass = "";
  if (status == "sucess") {
    CommentClass = "alert-success";
  }else if (status == "warning") {
    CommentClass = "alert-warning";
  }else if (status == "danger") {
    CommentClass = "alert-danger";
  }else if (status == "info") {
    CommentClass = "alert-info";
  }else{
    CommentClass = "alert-primary";
  }
  var htmlComment = `<div class="alert ${CommentClass}" role="alert">
      ${text}
  </div>`;
  CommentDiv.html(htmlComment);
}

//funkcja dodająca jsona z lista ksiazek do htmla
  function renderAllBooks(books){
    var booksTable = $("#booksTable").find("tbody");
    booksTable.html("");
    for (var i = 0; i < books.length; i++) {
      var newRow = $("<tr data-book-id=" + books[i].ID +  "></tr>");
      var titleCol = $("<td>").text(books[i].Title);
      titleCol.appendTo(newRow)
      var authorCol = $("<td>").text(books[i].Author);
      authorCol.appendTo(newRow)
      var buttons = $(`<td><div class="button-group">
                <button class="btn btn-primary btn-sm editBook">Edytuj</button>
                <button class="btn btn-danger btn-sm deleteBook">Usuń</button>
                <button class="btn btn-info btn-sm lendBook">Wypożycz</button>
            </div>
        </td>`);
      buttons.appendTo(newRow);
      newRow.appendTo(booksTable)
    }
  }

//funkcja dodająca jsona z lista czytelnikow do htmla
  function renderAllReaders(readers){
    var readersTable = $("#readersTable").find("tbody");
    readersTable.html("");
    for (var i = 0; i < readers.length; i++) {
      var newRow = $("<tr data-reader-id=" + readers[i].ID +  "></tr>");
      var NameCol = $("<td>").text(readers[i].Name);
      NameCol.appendTo(newRow)
      var AgeCol = $("<td>").text(readers[i].Age);
      AgeCol.appendTo(newRow)
      var buttons = $(`<td><div class="button-group">
                <button class="btn btn-primary btn-sm editReader">Edytuj</button>
                <button class="btn btn-danger btn-sm deleteReader">Usuń</button>
                <button style="display:none" class="btn btn-info btn-sm chooseReader">Wybierz</button>
            </div>
        </td>`);
      buttons.appendTo(newRow);
      newRow.appendTo(readersTable)
    }
  }

//funkcja dodająca jsona z lista wypozyczen do htmla
  function renderAllLends(lend){
    var lendTable = $("#lendTable").find("tbody");
    lendTable.html("");
    for (var i = 0; i < lend.length; i++) {
      var newRow = $("<tr data-lend-id=" + lend[i].ID +  "></tr>");
      var TitleCol = $("<td>").text(lend[i].Title);
      TitleCol.appendTo(newRow)
      var NameCol = $("<td>").text(lend[i].Name);
      NameCol.appendTo(newRow)
      var DateCol = $("<td>").text(lend[i].LendDate);
      DateCol.appendTo(newRow)
      var buttons = $(`<td><div class="button-group">
                <button class="btn btn-primary btn-sm given">Oddano</button>
            </div>
        </td>`);
      buttons.appendTo(newRow);
      newRow.appendTo(lendTable)
    }
  }

// CZĘŚĆ DLA KSIAZEK  //////////////////////////////////////////////////////////////////////////////////

//funcja ajax pobieranie wszystkich ksiazek
function GetAllBooks(){
  $.ajax({
    url: apiURL + "books/",
    type: "GET",
  }).done(function (response) {
    renderAllBooks(response);
  }).fail(function (error) {
    console.log("BŁĄD: ",error);
  })
}

// funcja ajax pobieranie ksiazki po ID
function GetBookByID (bookID){
  $.ajax({
    url: apiURL + "books/" + bookID,
    type: "GET",
  }).done(function (response) {
      renderBook(response);
  }).fail(function (error) {
    console.log("BŁĄD: ",error);
  })
}

//przycisk dodaj ksiazke
var AddBookButton = $("#addBookButton");
//dodanie eventu na przycisk dodaj ksiazke
AddBookButton.on("click", function(event) {
  //pole formularza na tytuł
  var TitleForm = $("#inputTitleForm").val();
  //pole formularza na autora
  var AuthorForm = $("#inputAuthorForm").val();
  var newBook = {
    Title: TitleForm,
    Author: AuthorForm
  };
  var bookID = $("#hiddenBookID").val();
  if (AddBookButton.html().includes("Dodaj")){

    if (TitleForm == null || AuthorForm == null) {
      ShowComment("Wymagane pola nie zostały wypełnione", "warning");
      return null;
    };
    AddBook(newBook);

  }else if (AddBookButton.html().includes("Edytuj")) {
    //wywolanie funkcji ajax edycji
    EditBook(bookID ,newBook);
    //zmiana nazwy edytuj na dodaj przycisku
    $("#addBookButton").html("Dodaj");

  }else{
    ShowComment("Błąd!!!", "warning");
  }
})

// funcja ajax dodawanie nowej ksiazki do bazy
function AddBook(newBook) {
  $.ajax({
    url: apiURL + "books",
    type: "POST",
    dateType: "json",
    data: newBook
  }).done(function () {
    ShowComment("Dodano nową książkę", "success");
    GetAllBooks();
    ClearTitleInput();
    ClearAuthorInput();

  }).fail(function (error) {
    ShowComment("Pojawił się problem z dodaniem nowej książki ", "warning");
  })
};

// funcja ajax edytowanie ksiazki z bazy
function EditBook(bookID, modifyBook) {
  $.ajax({
    url: apiURL + "books/" + bookID,
    type: "PUT",
    data: modifyBook
  }).done(function (response) {
      ShowComment("Edytowano wybraną książkę", "success");
      GetAllBooks();
      ClearTitleInput();
      ClearAuthorInput();
  }).fail(function (error) {
    ShowComment("Pojawił się problem z edytowaniem wybranej książki ", "warning");
  })
};

//usuwanie ksiazki
function RemoveBookByID(bookID) {
  $.ajax({
    url: apiURL + "books/" + bookID,
    type: "delete"
  }).done(function () {
      ShowComment("Usunięto wybraną książkę", "success");
      GetAllBooks();
  }).fail(function (error) {
      ShowComment("Nastąpił problem z usunięciem wybranej ksiażki", "warning");
      console.log(error.status, error.statusText);
  });
};


// CZĘŚĆ DLA CZYTELNIKOW ////////////////////////////////////////////////////////////////////////////////
//przycisk dodaj czytelnika
var AddReaderButton = $("#addReaderButton");

//pobieranie wszystkich  czytelnikow
function GetAllReaders(){
  $.ajax({
    url: apiURL + "readers/",
    type: "GET",
  }).done(function (response) {
    renderAllReaders(response);
  }).fail(function (error) {
    console.log("BŁĄD: ",error);
  })
}

//pobieranie czytelnika po ID
function GetReaderByID (readerID){
  $.ajax({
    url: apiURL + "readers/" + readerID,
    type: "GET",
    dataType: "JSON"
  }).done(function (response) {
      renderBook(response);
  }).fail(function (error) {
    console.log("BŁĄD: ",error);
  })
}

var AddReaderButton = $("#addReaderButton");
//dodanie eventu na przycisk dodaj ksiazke
AddReaderButton.on("click", function(event) {
  //pole formularza na tytuł
  var NameForm = $("#inputNameForm").val();
  //pole formularza na autora
  var AgeForm = $("#inputAgeForm").val();
  var newReader = {
    Name: NameForm,
    Age: AgeForm
  };
  var readerID = $("#hiddenReaderID").val();
  if (AddReaderButton.html().includes("Dodaj")) {
    if (NameForm == null || AgeForm == null) {
      ShowComment("Wymagane pola nie zostały wypełnione", "warning");
      return null;
    };
    AddReader(newReader);

  }else if (AddReaderButton.html().includes("Edytuj")) {
    //wywolanie funkcji ajax edycji
    EditReader(readerID ,newReader);
    console.log(readerID);
    console.log(newReader);
    //zmiana nazwy edytuj na dodaj przycisku
    $("#addReaderButton").html("Dodaj");

  }else{
    ShowComment("Błąd!!!", "warning");
  }
})

//dodawanie nowego czytelnika do bazy
function AddReader(newReader) {
  $.ajax({
    url: apiURL + "readers",
    type: "POST",

    data: newReader
  }).done(function (response) {
      ShowComment("Dodano nowego czytelnika", "success");
      GetAllReaders()
      ClearNameInput();
      ClearAgeInput();
  }).fail(function (error) {
    ShowComment("Pojawił się problem z dodaniem nowego czytelnika ", "warning");
  })
}

//edytowanie czytelnika
function EditReader(readerID ,modifyReader) {
  $.ajax({
    url: apiURL + "readers/" + readerID ,
    type: "PUT",
    data: modifyReader
  }).done(function (response) {
      ShowComment("Edytowano wybranego czytelnika", "success");
      GetAllReaders()
      ClearNameInput();
      ClearAgeInput();
  }).fail(function (error) {
    ShowComment("Pojawił się problem z edytowaniem wybranego czytelnika ", "warning");
  })
}

//usuwanie czytelnika
function RemoveReaderByID (readerID){
  $.ajax({
    url: apiURL + "readers/" + readerID,
    type: "DELETE"
  }).done(function (response) {
      ShowComment("Usunięto wybranego czytelnika", "success");
      GetAllReaders();
  }).fail(function (error) {
      ShowComment("Nastąpił problem z usunięciem wybranego czytelnika", "warning");
      console.log(error.status, error.statusText);
  })
};

// CZESC DLA WYPOZYCZEN  /////////////////////////////////////////////////////////////////////////////

function GetAllLendBook(){
  $.ajax({
    url: apiURL + "lend/",
    type: "GET",
  }).done(function (response) {
    renderAllLends(response);
  }).fail(function (error) {
    console.log("BŁĄD: ",error);
  })
}

function CreateLendBook(newLend){
  $.ajax({
    url: apiURL + "lend",
    type: "POST",
    data: newLend
  }).done(function (response) {
    ShowComment("Wypozyczono książkę", "success");
    GetAllLendBook();
  }).fail(function (error) {
    ShowComment("Nastąpił problem z wypozyczeniem książki do bazy", "warning");
  })
}

function RemoveLendByID(lendID){
  $.ajax({
    url: apiURL + "lend/" + lendID,
    type: "DELETE"
  }).done(function (response) {
      ShowComment("Zwrócono książke", "success");
      GetAllLendBook();
  }).fail(function (error) {
      ShowComment("Nastąpił problem ze zwróceniem książki do bazy", "warning");
      console.log(error.status, error.statusText)
  })
}

})
