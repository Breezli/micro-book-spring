package com.microbook.book.service;

import com.microbook.book.model.Book;
import com.microbook.book.repository.BookRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // 初始化一条测试数据
    public void initData() {
        if (bookRepository.count() == 0) {
            Book sample = new Book("微服务架构设计", "John Doe");
            sample.setIsbn("978-7-111-12345-6");
            sample.setDescription("介绍微服务架构的设计原则与实践");
            sample.setPrice(new java.math.BigDecimal("59.00"));
            bookRepository.save(sample);
        }
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public Book findById(Long id) {
        return bookRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "图书不存在"));
    }

    public Book create(Book book) {
        if (book.getTitle() == null || book.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "书名不能为空");
        }
        if (book.getAuthor() == null || book.getAuthor().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "作者不能为空");
        }
        book.setCreatedAt(java.time.LocalDateTime.now());
        return bookRepository.save(book);
    }

    public Book update(Long id, Book updated) {
        Book book = findById(id);
        if (updated.getTitle() != null) book.setTitle(updated.getTitle());
        if (updated.getAuthor() != null) book.setAuthor(updated.getAuthor());
        if (updated.getIsbn() != null) book.setIsbn(updated.getIsbn());
        if (updated.getDescription() != null) book.setDescription(updated.getDescription());
        if (updated.getPrice() != null) book.setPrice(updated.getPrice());
        return bookRepository.save(book);
    }

    public void delete(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "图书不存在");
        }
        bookRepository.deleteById(id);
    }
}
