import { ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core'
import { take } from 'rxjs'
import { TooltipService } from './tooltip.service'

@Directive({
  standalone: true,
  selector: '[seiriTooltip]',
})
export class TooltipDirective implements OnDestroy {
  @Input() tooltip: any[]
  @Input() id: number

  private componentRef: ComponentRef<any>

  constructor(private elementRef: ElementRef, private tooltipService: TooltipService) {}

  @HostListener('click', ['$event'])
  onMouseEnter(event: any): void {
    this.initializeTooltip()
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.componentRef.instance.mouseOut.pipe(take(1)).subscribe((isMousAway: boolean) => {
      if (isMousAway) {
        this.tooltipService.destroy(this.componentRef)
      }
    })
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart($event: TouchEvent): void {
    $event.preventDefault()
    this.initializeTooltip()
  }

  private initializeTooltip() {
    this.componentRef = this.tooltipService.addComponent(
      this.tooltip,
      this.elementRef.nativeElement.getBoundingClientRect(),
      this.elementRef.nativeElement.offsetTop,
    )
  }

  ngOnDestroy(): void {
    this.tooltipService.destroy(this.componentRef)
  }
}
