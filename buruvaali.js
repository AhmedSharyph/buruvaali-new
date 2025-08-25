/**
 * Buruvaali.js - Lightweight Accessible Dropdown with Search & Tags
 * Usage:
 *   <select class="buruvaali" data-allow-add="false">
 *     <option value="Malé">Malé</option>
 *     <option value="Hulhumalé">Hulhumalé</option>
 *   </select>
 *
 * Automatically converts native <select> into searchable dropdown.
 * Supports single select only (for now).
 */

(function (global) {
  // Auto-initialize on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("select.buruvaali").forEach(select => {
      // Avoid double initialization
      if (select.dataset.buruvaaliInitialized) return;
      new Buruvaali(select);
    });
  });

  function Buruvaali(select) {
    this.select = select;
    this.select.style.display = "none"; // Hide original
    this.select.dataset.buruvaaliInitialized = "true";

    this.allowAdd = this.select.dataset.allowAdd === "true";
    this.disabled = this.select.disabled;

    // Create wrapper
    this.wrapper = document.createElement("div");
    this.wrapper.className = "buruvaali";
    this.select.parentNode.insertBefore(this.wrapper, this.select);

    // Build enhanced UI
    this.selection = document.createElement("div");
    this.selection.className = "buruvaali-selection";
    this.wrapper.appendChild(this.selection);

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.className = "buruvaali-search";
    this.searchInput.placeholder = this.select.dataset.placeholder || "Search...";
    this.searchInput.autocomplete = "off";
    this.wrapper.appendChild(this.searchInput);

    this.dropdown = document.createElement("div");
    this.dropdown.className = "buruvaali-dropdown";
    this.wrapper.appendChild(this.dropdown);

    // Extract options
    this.options = Array.from(this.select.options).map(opt => ({
      value: opt.value,
      text: opt.text,
      disabled: opt.disabled
    }));

    this.selected = null;

    // If there's a pre-selected option, show it
    if (this.select.value) {
      const opt = this.options.find(o => o.value === this.select.value);
      if (opt) this.selectOption(opt.value);
    }

    this.renderDropdown();
    this.bindEvents();
  }

  Buruvaali.prototype.renderDropdown = function (filter) {
    this.dropdown.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const filtered = this.options.filter(opt =>
      !filter ||
      opt.text.toLowerCase().includes(filter.toLowerCase()) ||
      opt.value.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      const noOpt = document.createElement("div");
      noOpt.className = "buruvaali-option no-options";
      noOpt.textContent = "No options found";
      fragment.appendChild(noOpt);
    } else {
      filtered.forEach(opt => {
        if (opt.disabled) return;
        const el = document.createElement("div");
        el.className = "buruvaali-option";
        if (this.selected === opt.value) el.classList.add("active");
        el.textContent = opt.text;
        el.dataset.value = opt.value;
        el.addEventListener("click", () => {
          if (!el.classList.contains("disabled")) {
            this.selectOption(opt.value);
          }
        });
        fragment.appendChild(el);
      });
    }

    this.dropdown.appendChild(fragment);
  };

  Buruvaali.prototype.bindEvents = function () {
    const self = this;

    // Focus/search
    this.searchInput.addEventListener("focus", () => {
      if (!self.disabled) {
        self.dropdown.style.display = "block";
        self.renderDropdown(self.searchInput.value);
      }
    });

    this.searchInput.addEventListener("input", () => {
      self.renderDropdown(self.searchInput.value);
    });

    this.searchInput.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        self.dropdown.style.display = "none";
        self.searchInput.blur();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (self.allowAdd && self.searchInput.value.trim()) {
          const val = self.searchInput.value.trim();
          const text = val;
          // Avoid duplicates
          if (!self.options.some(o => o.value === val)) {
            const option = new Option(text, val, true, true);
            self.select.add(option);
            self.options.push({ value: val, text, disabled: false });
          }
          self.selectOption(val);
          self.searchInput.value = "";
        }
      }
    });

    // Close on outside click
    document.addEventListener("click", e => {
      if (!self.wrapper.contains(e.target)) {
        self.dropdown.style.display = "none";
      }
    });

    // Sync external changes
    this.select.addEventListener("change", () => {
      // Refresh UI if changed externally
      if (self.select.value !== self.selected) {
        if (self.selectedTag) {
          self.selection.removeChild(self.selectedTag);
          self.selectedTag = null;
        }
        self.selected = null;
        if (self.select.value) {
          self.selectOption(self.select.value);
        }
      }
    });
  };

  Buruvaali.prototype.selectOption = function (value) {
    const opt = this.options.find(o => o.value === value);
    if (!opt) return;

    // Clear previous selection
    if (this.selectedTag && this.selection.contains(this.selectedTag)) {
      this.selection.removeChild(this.selectedTag);
    }

    // Update native select
    this.select.value = value;
    this.select.dispatchEvent(new Event("change"));

    // Create tag
    const tag = document.createElement("div");
    tag.className = "buruvaali-tag";
    tag.textContent = opt.text;

    const remove = document.createElement("span");
    remove.textContent = "×";
    remove.className = "buruvaali-tag-remove";
    remove.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deselect();
    });

    tag.appendChild(remove);
    this.selection.insertBefore(tag, this.searchInput);

    this.selected = value;
    this.selectedTag = tag;
    this.searchInput.value = "";
    this.dropdown.style.display = "none";
  };

  Buruvaali.prototype.deselect = function () {
    if (this.selectedTag && this.selection.contains(this.selectedTag)) {
      this.selection.removeChild(this.selectedTag);
    }
    this.selectedTag = null;
    this.selected = null;
    this.select.value = "";
    this.select.dispatchEvent(new Event("change"));
    this.searchInput.focus();
  };

  // Optional: Expose destroy method
  Buruvaali.prototype.destroy = function () {
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.replaceChild(this.select, this.wrapper);
    }
    this.select.style.display = "";
    delete this.select.dataset.buruvaaliInitialized;
  };

  // Export
  global.Buruvaali = Buruvaali;
})(window);
