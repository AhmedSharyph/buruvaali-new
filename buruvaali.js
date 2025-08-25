class Buruvaali {
      constructor(select) {
        this.select = select;
        this.select.style.display = "none";
        this.isMultiple = this.select.multiple;

        // Container
        this.container = document.createElement("div");
        this.container.className = "buruvaali-container";

        // Selection area
        this.selection = document.createElement("div");
        this.selection.className = "buruvaali-selection";

        // Input
        this.input = document.createElement("input");
        this.input.className = "buruvaali-input";
        this.input.type = "text";
        this.selection.appendChild(this.input);

        this.container.appendChild(this.selection);

        // Dropdown
        this.dropdown = document.createElement("div");
        this.dropdown.className = "buruvaali-dropdown";

        // Options
        this.optionsList = document.createElement("div");
        this.select.querySelectorAll("option").forEach(opt => {
          const optionEl = document.createElement("div");
          optionEl.className = "buruvaali-option";
          optionEl.textContent = opt.textContent;
          optionEl.dataset.value = opt.value;
          optionEl.addEventListener("click", () => this.selectOption(opt.value, opt.textContent));
          this.optionsList.appendChild(optionEl);
        });

        this.dropdown.appendChild(this.optionsList);
        this.container.appendChild(this.dropdown);

        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);

        // Events
        this.input.addEventListener("focus", () => this.openDropdown());
        this.input.addEventListener("input", () => this.filterOptions());
        this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));
        document.addEventListener("click", (e) => {
          if (!this.container.contains(e.target)) {
            this.closeDropdown();
          }
        });
      }

      openDropdown() {
        this.dropdown.style.display = "block";
        this.filterOptions();
      }

      closeDropdown() {
        this.dropdown.style.display = "none";
      }

      filterOptions() {
        const search = this.input.value.toLowerCase();
        this.optionsList.querySelectorAll(".buruvaali-option").forEach(opt => {
          opt.style.display = opt.textContent.toLowerCase().includes(search) ? "block" : "none";
        });
      }

      handleKeyDown(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          const first = this.optionsList.querySelector(".buruvaali-option:not([style*='display: none'])");
          if (first) {
            this.selectOption(first.dataset.value, first.textContent);
          }
        }
      }

      selectOption(value, text) {
        if (this.isMultiple) {
          if ([...this.select.selectedOptions].some(o => o.value === value)) return;
          const tag = document.createElement("div");
          tag.className = "buruvaali-tag";
          tag.textContent = text;
          const remove = document.createElement("span");
          remove.textContent = "×";
          remove.addEventListener("click", () => {
            tag.remove();
            this.select.querySelector(`option[value="${value}"]`).selected = false;
          });
          tag.appendChild(remove);
          this.selection.insertBefore(tag, this.input);
          this.select.querySelector(`option[value="${value}"]`).selected = true;
        } else {
          this.selection.querySelectorAll(".buruvaali-tag").forEach(tag => tag.remove());
          this.select.value = value;
          const tag = document.createElement("div");
          tag.className = "buruvaali-tag";
          tag.textContent = text;
          const remove = document.createElement("span");
          remove.textContent = "×";
          remove.addEventListener("click", () => {
            tag.remove();
            this.select.value = "";
          });
          tag.appendChild(remove);
          this.selection.insertBefore(tag, this.input);
        }
        this.input.value = "";
        this.closeDropdown();
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("select.buruvaali").forEach(sel => new Buruvaali(sel));
    });
