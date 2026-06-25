package com.microbook.book.service;

import com.microbook.book.model.Book;
import com.microbook.book.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookService {

    private static final Logger log = LoggerFactory.getLogger(BookService.class);

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public void initData() {
        if (bookRepository.count() == 0) {
            Book sample = new Book("微服务架构设计", "John Doe");
            sample.setIsbn("978-7-111-12345-6");
            sample.setDescription("介绍微服务架构的设计原则与实践");
            sample.setPrice(new java.math.BigDecimal("59.00"));
            bookRepository.save(sample);
        }
    }

    @Cacheable(value = "books", key = "'all'")
    public List<Book> findAll() {
        log.info("Redis cache miss - querying DB for all books");
        return bookRepository.findAll();
    }

    @Cacheable(value = "books", key = "#id")
    public Book findById(Long id) {
        log.info("Redis cache miss - querying DB for book id: {}", id);
        return bookRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
    }

    @CacheEvict(value = "books", allEntries = true)
    public Book create(Book book) {
        if (book.getTitle() == null || book.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title cannot be empty");
        }
        if (book.getAuthor() == null || book.getAuthor().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Author cannot be empty");
        }
        book.setCreatedAt(java.time.LocalDateTime.now());
        return bookRepository.save(book);
    }

    @CacheEvict(value = "books", allEntries = true)
    public Book update(Long id, Book updated) {
        Book book = findById(id);
        if (updated.getTitle() != null) book.setTitle(updated.getTitle());
        if (updated.getAuthor() != null) book.setAuthor(updated.getAuthor());
        if (updated.getIsbn() != null) book.setIsbn(updated.getIsbn());
        if (updated.getDescription() != null) book.setDescription(updated.getDescription());
        if (updated.getPrice() != null) book.setPrice(updated.getPrice());
        return bookRepository.save(book);
    }

    @CacheEvict(value = "books", allEntries = true)
    public void delete(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found");
        }
        bookRepository.deleteById(id);
    }
}
