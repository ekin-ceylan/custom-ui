import { Pagination } from '../../../src/exports/custom-ui.js';
import { html, nothing } from '../../../src/exports/vendors/lit.js';
import { stringFormat } from '../../../src/modules/utilities.js';

// Same button
export class CustomPagination2 extends Pagination {
    get showLeftEllipsis() {
        return false;
    }

    get showRightEllipsis() {
        return false;
    }

    get visiblePages() {
        const siblingCount = Math.max(0, Number(this.siblingCount) || 0);
        const length = 2 * siblingCount + 1;
        const min = Math.max(Math.min(this.normalizedCurrentPage - siblingCount, this.normalizedPageCount - length + 1), 1);

        return Array.from({ length }, (_value, index) => min + index);
    }
}

// no-button
export class CustomPagination3 extends CustomPagination2 {
    get visiblePages() {
        return [];
    }

    renderAdornment() {
        return html`<li>
            <span><span>(${this.normalizedCurrentPage}</span> of <span>${this.normalizedPageCount})</span></span>
        </li>`;
    }
}

// responsive
export class CustomPagination4 extends CustomPagination2 {
    renderAdornment() {
        return html`<li class="mobile-only">
            <span><span>(${this.normalizedCurrentPage}</span> of <span>${this.normalizedPageCount})</span></span>
        </li>`;
    }
}

// link
export class CustomPagination5 extends Pagination {
    renderFirstItem() {
        return nothing;
    }

    renderLastItem() {
        return nothing;
    }

    renderSecondItem() {
        const ariaDisabled = this.isFirstPage ? 'true' : 'false';
        const pageNo = this.normalizedCurrentPage - 1;
        const ariaLabel = stringFormat(this.prevPageLabel, pageNo);

        return html`<a href="?page=${pageNo}" aria-label=${ariaLabel} aria-disabled=${ariaDisabled} ?disabled=${this.isFirstPage} @click=${e => this.requestPage(pageNo, e)}>
            &lt; Önceki
        </a>`;
    }

    renderSecondLastItem() {
        const ariaDisabled = this.isLastPage ? 'true' : 'false';
        const pageNo = this.normalizedCurrentPage + 1;
        const ariaLabel = stringFormat(this.nextPageLabel, pageNo);

        return html`<a href="?page=${pageNo}" aria-label=${ariaLabel} aria-disabled=${ariaDisabled} ?disabled=${this.isLastPage} @click=${e => this.requestPage(pageNo, e)}>
            Sonraki &gt;
        </a>`;
    }

    renderPageItem(pageNo) {
        const isActive = this.normalizedCurrentPage === pageNo;
        const ariaCurrent = isActive ? 'page' : nothing;
        const ariaDisabled = isActive ? 'true' : 'false';
        const ariaLabel = stringFormat(this.pageLabel, pageNo);

        return html`<a
            href="?page=${pageNo}"
            aria-label=${ariaLabel}
            aria-current=${ariaCurrent}
            aria-disabled=${ariaDisabled}
            ?disabled=${isActive}
            @click=${e => this.requestPage(pageNo, e)}
        >
            ${pageNo}
        </a>`;
    }
}

export class CustomPagination6 extends Pagination {
    get visiblePages() {
        const siblingCount = Math.max(0, Number(this.siblingCount) || 0);
        const min = Math.max(this.normalizedCurrentPage - siblingCount, 2);
        const max = Math.min(this.normalizedCurrentPage + siblingCount, this.normalizedPageCount - 1);

        return Array.from({ length: max - min + 1 }, (_value, index) => min + index);
    }

    get showLeftEllipsis() {
        return this.visiblePages[0] > 2;
    }

    get showRightEllipsis() {
        return this.visiblePages.at(-1) < this.normalizedPageCount - 1;
    }

    renderFirstItem() {
        return super.renderSecondItem();
    }

    renderLastItem() {
        return super.renderSecondLastItem();
    }

    renderSecondItem() {
        return this.renderPageItem(1);
    }

    renderSecondLastItem() {
        return this.renderPageItem(this.normalizedPageCount);
    }
}
