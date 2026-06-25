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
            Book b1 = new Book("微服务架构设计", "John Doe");
            b1.setIsbn("978-7-111-12345-6");
            b1.setDescription("介绍微服务架构的设计原则与实践，涵盖 Spring Cloud 组件");
            b1.setPrice(new java.math.BigDecimal("59.00"));
            bookRepository.save(b1);

            Book b2 = new Book("深入理解Java虚拟机", "周志明");
            b2.setIsbn("978-7-111-56789-0");
            b2.setDescription("JVM 内存管理、类加载机制与性能调优");
            b2.setPrice(new java.math.BigDecimal("89.00"));
            bookRepository.save(b2);

            Book b3 = new Book("Spring Boot 实战", "Craig Walls");
            b3.setIsbn("978-7-115-34567-8");
            b3.setDescription("Spring Boot 核心特性与微服务开发实践");
            b3.setPrice(new java.math.BigDecimal("69.00"));
            bookRepository.save(b3);

            Book b4 = new Book("Redis 设计与实现", "黄健宏");
            b4.setIsbn("978-7-111-23456-7");
            b4.setDescription("Redis 数据结构、持久化机制与缓存策略");
            b4.setPrice(new java.math.BigDecimal("49.00"));
            bookRepository.save(b4);

            Book b5 = new Book("Docker 实践", "李志伟");
            b5.setIsbn("978-7-115-45678-9");
            b5.setDescription("容器化部署与 Kubernetes 编排实战");
            b5.setPrice(new java.math.BigDecimal("55.00"));
            bookRepository.save(b5);
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
