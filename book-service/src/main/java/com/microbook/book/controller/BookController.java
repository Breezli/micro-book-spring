package com.microbook.book.controller;

import com.microbook.book.model.Book;
import com.microbook.book.service.BookService;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostConstruct
    public void init() {
        bookService.initData();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<Book> books = bookService.findAll();
        return ResponseEntity.ok(Map.of("books", books, "total", books.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("book", bookService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Book book) {
        Book created = bookService.create(book);
        return ResponseEntity.status(201).body(Map.of("book", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id,
                                                       @RequestBody Book book) {
        return ResponseEntity.ok(Map.of("book", bookService.update(id, book)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
