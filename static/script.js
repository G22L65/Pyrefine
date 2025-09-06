// Gemini Chatbot functionality
class GeminiChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.charCount = document.querySelector('.char-count');
        
        this.isTyping = false;
        this.conversationHistory = [];
        
        this.initializeEventListeners();
        this.autoResizeTextarea();
    }
    
    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send, Shift+Enter for new line
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Character count update
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.autoResizeTextarea();
        });
        
        // Focus input on load
        this.messageInput.focus();
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = `${count}/1000`;
        
        // Disable send button if message is empty or too long
        this.sendButton.disabled = count === 0 || count > 1000;
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.updateCharCount();
        this.autoResizeTextarea();
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Make API call to Gemini backend
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.hideTypingIndicator();
            
            // Check if response contains code
            if (this.containsCode(data.response)) {
                this.addCodeMessage(data.response);
            } else {
                this.addMessage(data.response, 'bot');
            }
            
            this.conversationHistory.push({ role: 'assistant', content: data.response });
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Error sending message:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Process content for inline code and formatting
        const processedContent = this.processMessageContent(content);
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar">${avatar}</div>
            </div>
            <div class="message-content">
                <div class="message-text">${processedContent}</div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addCodeMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const codeId = 'code_' + Date.now();
        const language = this.detectLanguage(content);
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar">🤖</div>
            </div>
            <div class="message-content">
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="copy-btn" onclick="copyCode('${codeId}')">Copy</button>
                    </div>
                    <div class="code-content" id="${codeId}">${this.escapeHtml(content)}</div>
                </div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    containsCode(text) {
        const codeRegex = /def |class |import |function |const |let |var |#include|<?php|<?xml|<!DOCTYPE|<html|<script|<style|SELECT |INSERT |UPDATE |DELETE |CREATE |ALTER |DROP /i;
        return codeRegex.test(text);
    }
    
    detectLanguage(text) {
        if (/def |class |import /.test(text)) return 'Python';
        if (/function |const |let |var /.test(text)) return 'JavaScript';
        if (/#include|int main/.test(text)) return 'C++';
        if (/<?php/.test(text)) return 'PHP';
        if (/<?xml|<!DOCTYPE/.test(text)) return 'XML';
        if (/<html|<script|<style/.test(text)) return 'HTML';
        if (/SELECT |INSERT |UPDATE |DELETE |CREATE /.test(text)) return 'SQL';
        return 'Code';
    }
    
    processMessageContent(content) {
        // Convert inline code (backticks) to styled spans
        content = content.replace(/`([^`]+)`/g, '<span class="inline-code">$1</span>');
        
        // Convert line breaks to <br> tags
        content = content.replace(/\n/g, '<br>');
        
        return this.escapeHtml(content);
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator show';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar">🤖</div>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Global function for copying code (called from HTML)
    static copyCode(codeId) {
        const codeBlock = document.getElementById(codeId);
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                // Show success feedback
                const button = codeBlock.parentElement.querySelector('.copy-btn');
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.background = '#22c55e';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '#4ade80';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
                alert('Failed to copy code to clipboard');
            });
        }
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GeminiChatbot();
});

// Global function for copying code (accessible from HTML onclick)
function copyCode(codeId) {
    GeminiChatbot.copyCode(codeId);
}

// Add some fun animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add click animation to send button
    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
    
    // Add focus effects to input
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('focus', function() {
        this.parentElement.style.borderColor = '#667eea';
        this.parentElement.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    });
    
    messageInput.addEventListener('blur', function() {
        this.parentElement.style.borderColor = '#e5e7eb';
        this.parentElement.style.boxShadow = 'none';
    });
});
