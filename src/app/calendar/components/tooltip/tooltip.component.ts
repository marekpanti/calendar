import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { TooltipDirective } from './tooltip.directive'
import { TooltipPosition, TooltipTheme } from './tooltip.enums'

@Component({
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  selector: 'seiri-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent {
  position: TooltipPosition = TooltipPosition.ABOVE
  theme: TooltipTheme = TooltipTheme.LIGHT
  tooltip: any[]
  left = 0
  top = 0
  visible = false
  id: number

  @Output() mouseOut = new EventEmitter()

  detectMouseOut() {
    this.mouseOut.emit(true)
  }
}
